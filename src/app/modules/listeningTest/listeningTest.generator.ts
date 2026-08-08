import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { uploadToCloudinary } from '@/app/lib/multer';
import { synthesizeSpeech } from '@/app/utils/textToSpeech';
import { Difficulty, ListeningContext, SessionType } from '@prisma/client';
import { IGeneratedQuestion, IGeneratedSection, IScriptLine } from './listeningTest.interface';
import { validateGeneratedQuestions } from '@/app/utils/validateGeneratedQuestion';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

// One TTS voice per section keeps synthesis to a single reliable API call per
// section instead of stitching together many per-speaker clips.
// Must be voices the tts-1 model actually accepts (its valid set is narrower
// than the SDK's TypeScript type, which also lists newer voices like
// 'verse'/'ballad' that tts-1 rejects at runtime).
const SECTION_VOICES = ['alloy', 'echo', 'onyx', 'nova'];

const TOPICS = [
  'booking accommodation',
  'local community facilities',
  'a university research project',
  'a museum exhibition tour',
  'staff training at a workplace',
  'planning a study trip',
  'a public health campaign',
  'a technology conference',
  'joining a local sports club',
  'a wildlife conservation project',
];

const pickTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)] ?? TOPICS[0]!;

interface ISectionSpec {
  order: number;
  context: ListeningContext;
  sceneDescription: string;
  typeInstruction: string;
  difficultyNote: string;
}

// Generating one section per API call (instead of all 4 in one shot) gives
// gpt-4o-mini a much narrower counting task - hit exactly 10 questions for
// ONE section with ONE type rule, instead of 4 counts and 2 purity rules at
// once. That combined task was the actual reason a single big call kept
// missing (e.g. [10,9,6,10] instead of [10,10,10,10]).
const SECTION_SPECS: ISectionSpec[] = [
  {
    order: 1,
    context: 'SOCIAL_CONVERSATION',
    sceneDescription:
      'a conversation between two people in an everyday social context (e.g. booking something, joining a club, arranging an appointment)',
    typeInstruction:
      'ALL 10 questions must be COMPLETION (form/note/table completion) - this is the standard real-exam pattern for Section 1. Do not use MCQ or MATCHING.',
    difficultyNote: 'This is the easiest section of the test.',
  },
  {
    order: 2,
    context: 'SOCIAL_MONOLOGUE',
    sceneDescription:
      'a monologue in an everyday social context (e.g. a talk about local facilities, a guided tour introduction)',
    typeInstruction:
      'Mostly MCQ (single-answer, 4 options), with 2-4 COMPLETION questions mixed in (note/form completion). MCQ should be the majority - aim for 6-8 MCQ and 2-4 completion, totaling exactly 10.',
    difficultyNote: 'This should be a little harder than Section 1.',
  },
  {
    order: 3,
    context: 'EDUCATIONAL_CONVERSATION',
    sceneDescription:
      'a conversation between up to four people in an educational/training context (e.g. students and a tutor discussing a project)',
    typeInstruction:
      'A mix of MCQ and MATCHING (e.g. matching several opinions/comments/tasks to a list of people or categories), totaling exactly 10. Do not use COMPLETION.',
    difficultyNote: 'This should be noticeably harder than Sections 1-2.',
  },
  {
    order: 4,
    context: 'ACADEMIC_MONOLOGUE',
    sceneDescription: 'a monologue on an academic subject (a lecture)',
    typeInstruction:
      'ALL 10 questions must be a single continuous COMPLETION (note/summary completion) - this is the standard real-exam pattern for Section 4. Do not use MCQ or MATCHING.',
    difficultyNote: 'This is the hardest section of the test.',
  },
];

const buildSectionSystemPrompt = (spec: ISectionSpec) => `You are an IELTS Academic Listening test writer.
Generate ONLY Section ${spec.order} of a 4-section IELTS Academic Listening test (not the whole test).

Context: ${spec.sceneDescription}. ${spec.difficultyNote}

This section must have EXACTLY 10 questions - not more, not fewer. Before you output the JSON,
count the items in your "questions" array. If it is not exactly 10, add or remove questions until
it is exactly 10, then re-count. Getting this count wrong makes the whole response unusable.
${spec.typeInstruction}

The "script" is an array of spoken turns ({"speaker": "A"|"B"|"C"|"D", "text": "..."}). Keep the
combined spoken text under 3000 characters so it fits one audio synthesis call. Questions must
follow the same order as the information appears in the script (the answer to question 1 must come
before the answer to question 2, and so on).

Question type rules:
- MCQ: 4 options, correctAnswer is one of them.
- COMPLETION: fill-in-the-blank (form/note/table/summary completion). No options. State a word
  limit directly in the question text, e.g. "Write NO MORE THAN TWO WORDS AND/OR A NUMBER".
  correctAnswer must be taken verbatim from the script (same word form/tense) and obey that limit.
- MATCHING: options is a list to match against, correctAnswer is the matching option text.

Never require a contracted word (e.g. "they're") as an answer, and prefer hyphenated compounds
counted as one word where natural. For every question also provide "acceptableAnswers": alternative
spellings/phrasings that should also count as correct (can be an empty array).

Respond ONLY with a JSON object in this exact shape:
{
  "title": "string (a short title for this section)",
  "script": [{ "speaker": "A", "text": "string" }],
  "questions": [
    {
      "type": "MCQ" | "COMPLETION" | "MATCHING",
      "text": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "acceptableAnswers": ["string"],
      "difficulty": "LOW" | "MEDIUM" | "HIGH"
    }
  ]
}`;

const scriptToNarration = (script: IGeneratedSection['script']) =>
  script.map((line) => line.text).join(' ... ');

const scriptToTranscript = (script: IGeneratedSection['script']) =>
  script.map((line) => `${line.speaker}: ${line.text}`).join('\n');

const synthesizeSection = async (section: IGeneratedSection, voice: string): Promise<string> => {
  const narration = scriptToNarration(section.script);
  const audioBuffer = await synthesizeSpeech(narration, voice);
  const result = (await uploadToCloudinary({ buffer: audioBuffer })) as { secure_url: string };
  return result.secure_url;
};

// gpt-4o-mini doesn't reliably hit exactly 10 questions on the first try, but
// retries are cheap on the mini model - so retry a few times before giving
// up, instead of paying for gpt-4o. This only re-runs the text generation
// for this one section, not TTS synthesis, which happens after all 4
// sections validate successfully.
const MAX_GENERATION_ATTEMPTS = 6;

const requestListeningSection = async (
  spec: ISectionSpec,
  difficulty: Difficulty,
  topic: string,
): Promise<IGeneratedSection> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSectionSystemPrompt(spec) },
      {
        role: 'user',
        content: `Generate Section ${spec.order} at overall difficulty ${difficulty}. Base the scenario on "${topic}", adapted naturally to fit this section's required context.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error(`No content received from OpenAI for listening section ${spec.order}`);
  }

  const parsed = JSON.parse(raw) as {
    title: string;
    script: IScriptLine[];
    questions: IGeneratedQuestion[];
  };

  if (!Array.isArray(parsed.script) || parsed.script.length === 0) {
    throw new Error(`Invalid listening section ${spec.order}: empty script`);
  }
  if (!Array.isArray(parsed.questions) || parsed.questions.length !== 10) {
    throw new Error(
      `Invalid listening section ${spec.order}: expected exactly 10 questions, got ${parsed.questions?.length ?? 0}`,
    );
  }
  validateGeneratedQuestions(parsed.questions, `Listening section ${spec.order}`);

  return {
    order: spec.order,
    title: parsed.title,
    context: spec.context,
    script: parsed.script,
    questions: parsed.questions,
  };
};

const generateSectionWithRetry = async (
  spec: ISectionSpec,
  difficulty: Difficulty,
  topic: string,
): Promise<IGeneratedSection> => {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      return await requestListeningSection(spec, difficulty, topic);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(`Unknown error generating section ${spec.order}`);
    }
  }
  throw new Error(
    `Listening section ${spec.order} failed after ${MAX_GENERATION_ATTEMPTS} attempts: ${lastError?.message}`,
  );
};

const generateListeningTest = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic();

  const sections = await Promise.all(
    SECTION_SPECS.map((spec) => generateSectionWithRetry(spec, difficulty, topic)),
  );

  const title = `${topic.charAt(0).toUpperCase()}${topic.slice(1)} - IELTS Listening Practice`;

  const sectionsWithAudio = await Promise.all(
    sections.map(async (section, index) => {
      const voice = SECTION_VOICES[index % SECTION_VOICES.length] ?? 'alloy';
      const audioUrl = await synthesizeSection(section, voice);
      return { section, audioUrl };
    }),
  );

  const listeningTest = await prisma.listeningTest.create({
    data: {
      title,
      difficulty,
      sections: {
        create: sectionsWithAudio.map(({ section, audioUrl }) => ({
          title: section.title,
          order: section.order,
          context: section.context,
          audioUrl,
          transcript: scriptToTranscript(section.script),
          questions: {
            create: section.questions.map((q) => ({
              type: q.type,
              sessionType: SessionType.IELTS_LISTENING,
              text: q.text,
              options: q.options ?? [],
              correctAnswer: q.correctAnswer ?? null,
              acceptableAnswers: q.acceptableAnswers ?? [],
              difficulty: q.difficulty ?? difficulty,
              aiGenerated: true,
            })),
          },
        })),
      },
    },
  });

  return listeningTest;
};

export const ListeningTestGenerator = { generateListeningTest };

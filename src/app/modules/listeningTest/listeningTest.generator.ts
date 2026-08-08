import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { uploadToCloudinary } from '@/app/lib/multer';
import { synthesizeSpeech } from '@/app/utils/textToSpeech';
import { Difficulty, ListeningContext, SessionType } from '@prisma/client';
import { IGeneratedListeningTest, IGeneratedSection } from './listeningTest.interface';

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

const pickTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)];

const SYSTEM_PROMPT = `You are an IELTS Academic Listening test writer. Generate a full listening test
matching the real IELTS format: exactly 4 sections of increasing difficulty.

- Section 1: a conversation between two people in an everyday social context (e.g. booking something).
- Section 2: a monologue in an everyday social context (e.g. a talk about local facilities).
- Section 3: a conversation between up to four people in an educational/training context.
- Section 4: a monologue on an academic subject.

Each section's "script" is an array of spoken turns ({"speaker": "A"|"B"|"C"|"D", "text": "..."}).
Keep the combined spoken text of a section under 3000 characters so it fits one audio synthesis call.

Each section must have about 10 questions, mixing these types:
- MCQ: 4 options, correctAnswer is one of them.
- COMPLETION: fill-in-the-blank (form/note/table/summary completion), no options, correctAnswer is the missing word(s).
- SHORT_ANSWER: no options, correctAnswer is no more than three words.
- MATCHING: options is a list to match against, correctAnswer is the matching option text.

For every question also provide "acceptableAnswers": alternative spellings/phrasings that should
also count as correct (can be an empty array).

Respond ONLY with a JSON object in this exact shape:
{
  "title": "string",
  "sections": [
    {
      "order": 1,
      "title": "string",
      "context": "SOCIAL_CONVERSATION" | "SOCIAL_MONOLOGUE" | "EDUCATIONAL_CONVERSATION" | "ACADEMIC_MONOLOGUE",
      "script": [{ "speaker": "A", "text": "string" }],
      "questions": [
        {
          "type": "MCQ" | "COMPLETION" | "SHORT_ANSWER" | "MATCHING",
          "text": "string",
          "options": ["string"],
          "correctAnswer": "string",
          "acceptableAnswers": ["string"],
          "difficulty": "LOW" | "MEDIUM" | "HIGH"
        }
      ]
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

const generateListeningTest = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate one complete Academic Listening test at overall difficulty ${difficulty}. Base the scenario broadly on "${topic}", adapted naturally to fit each section's required context.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error('No content received from OpenAI for listening test generation');
  }

  const parsed = JSON.parse(raw) as IGeneratedListeningTest;
  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Invalid listening test format received from OpenAI');
  }

  const sectionsWithAudio = await Promise.all(
    parsed.sections.map(async (section, index) => {
      const voice = SECTION_VOICES[index % SECTION_VOICES.length] ?? 'alloy';
      const audioUrl = await synthesizeSection(section, voice);
      return { section, audioUrl };
    }),
  );

  const listeningTest = await prisma.listeningTest.create({
    data: {
      title: parsed.title,
      difficulty,
      sections: {
        create: sectionsWithAudio.map(({ section, audioUrl }) => ({
          title: section.title,
          order: section.order,
          context: section.context as ListeningContext,
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

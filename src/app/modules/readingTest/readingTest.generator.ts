import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { Difficulty, SessionType } from '@prisma/client';
import { IGeneratedReadingTest } from './readingTest.interface';
import { diagramSpecToImageUrl } from '@/app/utils/diagramRenderer';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const TOPICS = [
  'environmental science',
  'space exploration',
  'ancient history',
  'psychology',
  'renewable energy',
  'urban planning',
  'marine biology',
  'economics',
  'artificial intelligence',
  'anthropology',
  'nutrition science',
  'linguistics',
];

const pickTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)];

const SYSTEM_PROMPT = `You are an IELTS Academic Reading test writer. Generate a full reading test
matching the real IELTS Academic Reading format: exactly 3 passages of increasing difficulty
(passage 1 easiest, passage 3 hardest), each 650-850 words, long-form journal/article style
suitable for a non-specialist audience entering university, with at least one passage containing
detailed logical argument.

Each passage must have about 13 questions, mixing these types. Use a genuine mix across the whole
test, not just MCQ:
- MCQ: 4 options, correctAnswer is one of them. Questions must follow the same order as the
  information appears in the passage.
- TRUE_FALSE_NOT_GIVEN: use ONLY for passages/statements that report FACTS. No options.
  correctAnswer is exactly "True", "False", or "Not Given". "False" means the statement
  contradicts the passage; "Not Given" means the passage neither confirms nor denies it.
- YES_NO_NOT_GIVEN: use ONLY for statements about the WRITER'S OPINIONS OR CLAIMS (not plain
  facts). No options. correctAnswer is exactly "Yes", "No", or "Not Given". "No" means the
  statement contradicts the writer's view; "Not Given" means the writer's view on it is unclear.
- MATCHING: vary the matching sub-type across the test — matching headings to paragraphs
  (options = a list of headings, more headings than paragraphs), matching information to
  paragraphs (options = paragraph letters), matching features (options = a list of features to
  match to items), or matching sentence endings (options = a list of possible endings). Say in
  the question text which kind of matching it is. correctAnswer is the matching option text.
- COMPLETION: fill-in-the-blank (sentence/summary/note/table/flow-chart completion). No options.
  The answer must be one or more words copied VERBATIM from the passage (do not change word
  form/tense). State the word limit directly in the question text, e.g. "using NO MORE THAN TWO
  WORDS from the passage". correctAnswer must obey that same limit.
- SHORT_ANSWER: no options. State a word limit in the question text (e.g. "NO MORE THAN THREE
  WORDS"), and correctAnswer must obey it, taken verbatim from the passage.
- DIAGRAM_LABEL: only used inside passage 2, which must also carry a "diagram" object (see below).
  No options. The question text asks what belongs at one specific numbered position, e.g. "What is
  located at position 3 on the diagram?". correctAnswer is a short word/phrase from the passage
  that correctly identifies that position. Set "blankNumber" to the matching shape's blankNumber.

Passage 2 must additionally describe, and include a diagram for, either (a) a physical place with
distinct areas/rooms (a building, site, or facility), or (b) a simple sequential process or
mechanism — whichever fits the passage's topic better. Include a "diagram" object on passage 2:
{
  "type": "floorplan" | "process",
  "title": "string",
  "shapes": [
    { "id": "string", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100, "label": "string" },
    { "id": "string", "x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100, "blankNumber": 1 }
  ],
  "connections": [{ "fromId": "string", "toId": "string" }]
}
Use 4-8 shapes for a floorplan (a mix of pre-labeled shapes for orientation and 3-5 numbered
blanks), or 3-6 shapes with "connections" between them in sequence for a process (label the start
and end shapes, numbered-blank the middle steps). x/y/width/height are percentages of the canvas —
lay shapes out so they don't overlap. Add exactly one DIAGRAM_LABEL question per numbered blank
shape, and reduce passage 2's other question types slightly so the total is still about 13.

For every question also provide "acceptableAnswers": a short array of alternative spellings or
phrasings that should also count as correct (can be an empty array).

Respond ONLY with a JSON object in this exact shape:
{
  "title": "string",
  "passages": [
    {
      "order": 1,
      "title": "string",
      "content": "string (the full passage text)",
      "diagram": { "type": "floorplan" | "process", "title": "string", "shapes": [], "connections": [] },
      "questions": [
        {
          "type": "MCQ" | "TRUE_FALSE_NOT_GIVEN" | "YES_NO_NOT_GIVEN" | "MATCHING" | "COMPLETION" | "SHORT_ANSWER" | "DIAGRAM_LABEL",
          "text": "string",
          "options": ["string"],
          "correctAnswer": "string",
          "acceptableAnswers": ["string"],
          "blankNumber": 1,
          "difficulty": "LOW" | "MEDIUM" | "HIGH"
        }
      ]
    }
  ]
}
Omit "diagram" entirely for passages 1 and 3, and omit "blankNumber" for non-DIAGRAM_LABEL questions.`;

const generateReadingTest = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate one complete Academic Reading test at overall difficulty ${difficulty}. Base all three passages on the general theme of "${topic}", each passage covering a distinct angle of that theme.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error('No content received from OpenAI for reading test generation');
  }

  const parsed = JSON.parse(raw) as IGeneratedReadingTest;

  if (!Array.isArray(parsed.passages) || parsed.passages.length === 0) {
    throw new Error('Invalid reading test format received from OpenAI');
  }

  const readingTest = await prisma.readingTest.create({
    data: {
      title: parsed.title,
      difficulty,
      passages: {
        create: parsed.passages.map((passage) => {
          const diagramImageUrl = passage.diagram ? diagramSpecToImageUrl(passage.diagram) : null;

          return {
            title: passage.title,
            content: passage.content,
            order: passage.order,
            questions: {
              create: passage.questions.map((q) => ({
                type: q.type,
                sessionType: SessionType.IELTS_READING,
                text: q.text,
                options: q.options ?? [],
                correctAnswer: q.correctAnswer ?? null,
                acceptableAnswers: q.acceptableAnswers ?? [],
                imageUrl: q.type === 'DIAGRAM_LABEL' ? diagramImageUrl : null,
                difficulty: q.difficulty ?? difficulty,
                aiGenerated: true,
              })),
            },
          };
        }),
      },
    },
  });

  return readingTest;
};

export const ReadingTestGenerator = { generateReadingTest };

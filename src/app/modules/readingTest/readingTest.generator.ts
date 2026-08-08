import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { Difficulty, SessionType } from '@prisma/client';
import { IGeneratedReadingTest } from './readingTest.interface';

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
      "questions": [
        {
          "type": "MCQ" | "TRUE_FALSE_NOT_GIVEN" | "YES_NO_NOT_GIVEN" | "MATCHING" | "COMPLETION" | "SHORT_ANSWER",
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
        create: parsed.passages.map((passage) => ({
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
              difficulty: q.difficulty ?? difficulty,
              aiGenerated: true,
            })),
          },
        })),
      },
    },
  });

  return readingTest;
};

export const ReadingTestGenerator = { generateReadingTest };

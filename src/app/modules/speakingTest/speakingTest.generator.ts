import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { Difficulty } from '@prisma/client';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const TOPICS = [
  'hometown and living situation',
  'work or studies',
  'hobbies and free time',
  'travel and holidays',
  'technology in daily life',
  'food and cooking',
  'friendships and relationships',
  'shopping habits',
  'a memorable event',
  'daily routines',
];

const pickTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)];

const SYSTEM_PROMPT = `You are an IELTS Speaking examiner writing a new test. Generate a full 3-part
speaking test matching the real IELTS format:

- Part 1 (Introduction and Interview): 4-5 simple personal questions about a familiar everyday topic.
- Part 2 (Individual Long Turn): a cue card topic with 3-4 "you should say" bullet points, on a
  related but distinct topic from Part 1.
- Part 3 (Two-Way Discussion): 4-5 more abstract discussion questions that extend the Part 2 topic
  into broader, more analytical territory (opinions, comparisons, society-level implications).

Respond ONLY with JSON in this exact shape:
{
  "part1Topic": "string (short label for the Part 1 theme)",
  "part1Questions": ["string", "string", "string", "string"],
  "cueCardTopic": "string (e.g. 'Describe a book that influenced you')",
  "cueCardBullets": ["string", "string", "string", "string"],
  "part3Questions": ["string", "string", "string", "string"]
}`;

const generateSpeakingTest = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate one complete Speaking test at difficulty ${difficulty}, broadly themed around "${topic}".`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error('No content received from OpenAI for speaking test generation');
  }

  const parsed = JSON.parse(raw) as {
    part1Topic: string;
    part1Questions: string[];
    cueCardTopic: string;
    cueCardBullets: string[];
    part3Questions: string[];
  };

  if (!parsed.part1Questions?.length || !parsed.part3Questions?.length || !parsed.cueCardBullets?.length) {
    throw new Error('Invalid speaking test format received from OpenAI');
  }

  return prisma.speakingTest.create({
    data: {
      part1Topic: parsed.part1Topic,
      part1Questions: parsed.part1Questions,
      cueCardTopic: parsed.cueCardTopic,
      cueCardBullets: parsed.cueCardBullets,
      part3Questions: parsed.part3Questions,
      difficulty,
    },
  });
};

export const SpeakingTestGenerator = { generateSpeakingTest };

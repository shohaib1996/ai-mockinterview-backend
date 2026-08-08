import { OpenAI } from 'openai';
import config from '@/app/config';
import prisma from '@/app/lib/prisma';
import { uploadToCloudinary } from '@/app/lib/multer';
import { Difficulty, IELTSWritingTaskType } from '@prisma/client';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const TASK1_TOPICS = [
  'population growth in different countries',
  'household spending patterns',
  'university enrollment trends',
  'stages of a manufacturing process',
  'international tourism numbers',
  'energy consumption by source',
  'the water cycle process',
  'company revenue over five years',
];

const TASK2_TOPICS = [
  'technology and education',
  'urbanization and environment',
  'work-life balance',
  'globalization and local culture',
  'government spending priorities',
  'social media and society',
  'renewable energy adoption',
  'crime prevention approaches',
];

const pickTopic = (topics: string[]) => topics[Math.floor(Math.random() * topics.length)];

interface IChartConfig {
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

const buildQuickChartUrl = (chartConfig: IChartConfig) => {
  const config = {
    type: chartConfig.type,
    data: {
      labels: chartConfig.labels,
      datasets: chartConfig.datasets.map((d) => ({ label: d.label, data: d.data })),
    },
  };
  return `https://quickchart.io/chart?width=700&height=450&format=png&c=${encodeURIComponent(
    JSON.stringify(config),
  )}`;
};

const generateTask1 = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic(TASK1_TOPICS);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an IELTS Academic Writing Task 1 examiner writing a new task.
Generate a prompt asking the candidate to summarize/describe visual data (bar chart, line chart, or pie chart),
plus the underlying chart data itself, related to "${topic}".

Respond ONLY with JSON in this shape:
{
  "promptText": "string (the Task 1 instructions, e.g. 'The chart below shows... Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.')",
  "chart": {
    "type": "bar" | "line" | "pie",
    "labels": ["string"],
    "datasets": [{ "label": "string", "data": [number] }]
  }
}`,
      },
      {
        role: 'user',
        content: `Generate one Task 1 prompt and chart at difficulty ${difficulty}.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error('No content received from OpenAI for writing task 1 generation');
  }

  const parsed = JSON.parse(raw) as { promptText: string; chart: IChartConfig };
  const chartUrl = buildQuickChartUrl(parsed.chart);

  const chartResponse = await fetch(chartUrl);
  if (!chartResponse.ok) {
    throw new Error(`Failed to render chart image: HTTP ${chartResponse.status}`);
  }
  const chartBuffer = Buffer.from(await chartResponse.arrayBuffer());
  const uploadResult = (await uploadToCloudinary({ buffer: chartBuffer })) as { secure_url: string };

  return prisma.writingTask.create({
    data: {
      task: IELTSWritingTaskType.TASK1,
      promptText: parsed.promptText,
      imageUrl: uploadResult.secure_url,
      chartConfig: parsed.chart as any,
      difficulty,
    },
  });
};

const generateTask2 = async (difficulty: Difficulty = 'MEDIUM') => {
  const topic = pickTopic(TASK2_TOPICS);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an IELTS Academic Writing Task 2 examiner writing a new essay prompt.
Generate a discursive essay question (opinion, discussion, problem/solution, or advantages/disadvantages
style) related to "${topic}", worded exactly as it would appear on the real test, ending with an
instruction to write at least 250 words.

Respond ONLY with JSON: { "promptText": "string" }`,
      },
      {
        role: 'user',
        content: `Generate one Task 2 essay prompt at difficulty ${difficulty}.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error('No content received from OpenAI for writing task 2 generation');
  }

  const parsed = JSON.parse(raw) as { promptText: string };

  return prisma.writingTask.create({
    data: {
      task: IELTSWritingTaskType.TASK2,
      promptText: parsed.promptText,
      difficulty,
    },
  });
};

export const WritingTaskGenerator = { generateTask1, generateTask2 };

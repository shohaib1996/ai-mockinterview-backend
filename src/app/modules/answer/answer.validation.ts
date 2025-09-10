import { z } from 'zod';

const answerObjectSchema = z.object({
  sessionId: z.string({
    message: 'Session ID is required',
  }),
  questionId: z.string({
    message: 'Question ID is required',
  }),
  answerText: z.string().optional(),
  isCorrect: z.boolean().optional(),
  score: z.number().optional(),
  feedback: z.any().optional(),
});

const createAnswerZodSchema = z.object({
  body: z.union([answerObjectSchema, z.array(answerObjectSchema)]),
});

const updateAnswerZodSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
    questionId: z.string().optional(),
    answerText: z.string().optional(),
    isCorrect: z.boolean().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

export const AnswerValidation = {
  createAnswerZodSchema,
  updateAnswerZodSchema,
};

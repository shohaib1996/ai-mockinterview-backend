import { z } from 'zod';

const createQuizAttemptZodSchema = z.object({
  body: z.object({
    quizName: z.string({
      message: 'Quiz name is required',
    }),
    startedAt: z.string().default(new Date().toISOString()),
    endedAt: z.string().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

const updateQuizAttemptZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    quizName: z.string().optional(),
    startedAt: z.string().optional(),
    endedAt: z.string().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

export const QuizAttemptValidation = {
  createQuizAttemptZodSchema,
  updateQuizAttemptZodSchema,
};

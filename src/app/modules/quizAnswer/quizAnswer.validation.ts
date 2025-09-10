import { z } from 'zod';

const quizAnswerObjectSchema = z.object({
  quizAttemptId: z.string({
    message: 'Quiz Attempt ID is required',
  }),
  questionId: z.string({
    message: 'Question ID is required',
  }),
  selectedOption: z.string().optional(),
  answerText: z.string().optional(),
  isCorrect: z.boolean().optional(),
  score: z.number().optional(),
  feedback: z.any().optional(),
});

const createQuizAnswerZodSchema = z.object({
  body: z.union([quizAnswerObjectSchema, z.array(quizAnswerObjectSchema)]),
});

const updateQuizAnswerZodSchema = z.object({
  body: z.object({
    quizAttemptId: z.string().optional(),
    questionId: z.string().optional(),
    selectedOption: z.string().optional(),
    answerText: z.string().optional(),
    isCorrect: z.boolean().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

export const QuizAnswerValidation = {
  createQuizAnswerZodSchema,
  updateQuizAnswerZodSchema,
};

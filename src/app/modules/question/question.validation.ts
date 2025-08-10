import { z } from 'zod';
import { QuestionType, SessionType, Difficulty } from '@prisma/client';

const createQuestionZodSchema = z.object({
  body: z.object({
    type: z.nativeEnum(QuestionType, {
      message: 'Question type is required',
    }),
    sessionType: z.nativeEnum(SessionType, {
      message: 'Session type is required',
    }),
    text: z.string({
      message: 'Question text is required',
    }),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    aiGenerated: z.boolean().optional(),
    listeningAudioId: z.string().optional(),
    readingPassageId: z.string().optional(),
  }),
});

const updateQuestionZodSchema = z.object({
  body: z.object({
    type: z.nativeEnum(QuestionType).optional(),
    sessionType: z.nativeEnum(SessionType).optional(),
    text: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    aiGenerated: z.boolean().optional(),
    listeningAudioId: z.string().optional(),
    readingPassageId: z.string().optional(),
  }),
});

export const QuestionValidation = {
  createQuestionZodSchema,
  updateQuestionZodSchema,
};

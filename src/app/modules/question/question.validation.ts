import { z } from 'zod';
import { QuestionType, SessionType, Difficulty } from '@prisma/client';

const questionObjectSchema = z.object({
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
  quizAttemptId: z.string().optional(),
});

const createQuestionZodSchema = z.object({
  body: z.union([questionObjectSchema, z.array(questionObjectSchema)]),
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
    quizAttemptId: z.string().optional(),
  }),
});

const generateQuestionsZodSchema = z.object({
  body: z.object({
    promptText: z.string({
      required_error: 'Prompt text is required',
    }),
    numberOfQuestions: z.number().int().min(1).max(10, 'Cannot generate more than 10 questions'),
  }),
});

export const QuestionValidation = {
  createQuestionZodSchema,
  updateQuestionZodSchema,
  generateQuestionsZodSchema,
};

import { z } from 'zod';
import { IELTSWritingTask } from '@prisma/client';

const createWritingSubmissionZodSchema = z.object({
  body: z.object({
    userId: z.string({
     message: 'User ID is required',
    }),
    sessionId: z.string().optional(),
    writingTask: z.nativeEnum(IELTSWritingTask, {
     message: 'Writing task is required',
    }),
    imageUrl: z.string({
     message: 'Image URL is required',
    }),
    extractedText: z.string().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

const updateWritingSubmissionZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    writingTask: z.nativeEnum(IELTSWritingTask).optional(),
    imageUrl: z.string().optional(),
    extractedText: z.string().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

export const WritingSubmissionValidation = {
  createWritingSubmissionZodSchema,
  updateWritingSubmissionZodSchema,
};
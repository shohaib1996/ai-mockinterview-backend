import { z } from 'zod';
import { IELTSWritingTaskType, Difficulty } from '@prisma/client';

const createWritingTaskZodSchema = z.object({
  body: z.object({
    task: z.nativeEnum(IELTSWritingTaskType, {
      message: 'Writing task type is required',
    }),
    promptText: z.string({
      message: 'Prompt text is required',
    }),
    imageUrl: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
  }),
});

const updateWritingTaskZodSchema = z.object({
  body: z.object({
    task: z.nativeEnum(IELTSWritingTaskType).optional(),
    promptText: z.string().optional(),
    imageUrl: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
  }),
});

export const WritingTaskValidation = {
  createWritingTaskZodSchema,
  updateWritingTaskZodSchema,
};

import { z } from 'zod';
import { SessionType } from '@prisma/client';

const createSessionZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    type: z.nativeEnum(SessionType, {
      message: 'Session type is required',
    }),
    startedAt: z.string().default(() => new Date().toISOString()),
    endedAt: z.string().optional(),
    score: z.number().optional(),
    transcript: z.string().optional(),
    feedback: z.any().optional(),
  }),
});

const updateSessionZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    type: z.nativeEnum(SessionType).optional(),
    startedAt: z.string().optional(),
    endedAt: z.string().optional(),
    score: z.number().optional(),
    transcript: z.string().optional(),
    feedback: z.any().optional(),
  }),
});

export const SessionValidation = {
  createSessionZodSchema,
  updateSessionZodSchema,
};

import { z } from 'zod';
import { Difficulty } from '@prisma/client';

const createSpeakingTestZodSchema = z.object({
  body: z.object({
    part1Topic: z.string().min(1, 'Part 1 topic is required'),
    part1Questions: z.array(z.string().min(1)).min(1, 'At least one Part 1 question is required'),
    cueCardTopic: z.string().min(1, 'Cue card topic is required'),
    cueCardBullets: z.array(z.string().min(1)).min(1, 'At least one cue card bullet is required'),
    part2FollowUpQuestions: z
      .array(z.string().min(1))
      .min(1, 'At least one Part 2 follow-up question is required'),
    part3Questions: z.array(z.string().min(1)).min(1, 'At least one Part 3 question is required'),
    difficulty: z.nativeEnum(Difficulty).optional(),
  }),
});

const updateSpeakingTestZodSchema = z.object({
  body: z.object({
    part1Topic: z.string().min(1).optional(),
    part1Questions: z.array(z.string().min(1)).optional(),
    cueCardTopic: z.string().min(1).optional(),
    cueCardBullets: z.array(z.string().min(1)).optional(),
    part2FollowUpQuestions: z.array(z.string().min(1)).optional(),
    part3Questions: z.array(z.string().min(1)).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
  }),
});

export const SpeakingTestBankValidation = {
  createSpeakingTestZodSchema,
  updateSpeakingTestZodSchema,
};

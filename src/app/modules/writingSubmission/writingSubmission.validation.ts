import { z } from 'zod';

const createWritingSubmissionZodSchema = z.object({
  body: z.object({
    userId: z.string({
      message: 'User ID is required',
    }),
    sessionId: z.string().optional(),
    writingTaskId: z.string({
      message: 'Writing task ID is required',
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
    writingTaskId: z.string().optional(),
    extractedText: z.string().optional(),
    score: z.number().optional(),
    feedback: z.any().optional(),
  }),
});

export const WritingSubmissionValidation = {
  createWritingSubmissionZodSchema,
  updateWritingSubmissionZodSchema,
};

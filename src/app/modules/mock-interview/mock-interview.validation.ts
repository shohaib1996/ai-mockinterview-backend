import { z } from 'zod';

const chatValidationSchema = z.object({
  body: z.object({
    conversation: z.array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    ),
  }),
});

export const MockInterviewValidation = {
  chatValidationSchema,
};

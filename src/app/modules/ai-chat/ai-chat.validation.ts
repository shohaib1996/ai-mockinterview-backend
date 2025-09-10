import { z } from 'zod';

const createChatCompletionZodSchema = z.object({
  body: z.object({
    conversation: z.array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    ),
  }),
});

const getConversationBySessionIdZodSchema = z.object({
  params: z.object({
    sessionId: z.string({
      required_error: 'Session ID is required',
    }),
  }),
});

export const AiChatValidation = {
  createChatCompletionZodSchema,
  getConversationBySessionIdZodSchema,
};

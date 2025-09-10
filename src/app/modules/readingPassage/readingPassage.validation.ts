import { z } from 'zod';

const createReadingPassageZodSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Title is required',
    }),
    content: z.string({
      message: 'Content is required',
    }),
  }),
});

const updateReadingPassageZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
  }),
});

export const ReadingPassageValidation = {
  createReadingPassageZodSchema,
  updateReadingPassageZodSchema,
};

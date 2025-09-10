import { z } from 'zod';

const createListeningAudioZodSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Title is required',
    }),
    audioUrl: z.string({
      message: 'Audio URL is required',
    }),
    transcript: z.string({
      message: 'Transcript is required',
    }),
  }),
});

const updateListeningAudioZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    audioUrl: z.string().optional(),
    transcript: z.string().optional(),
  }),
});

export const ListeningAudioValidation = {
  createListeningAudioZodSchema,
  updateListeningAudioZodSchema,
};

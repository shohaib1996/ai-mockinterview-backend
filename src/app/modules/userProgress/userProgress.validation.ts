import { z } from 'zod';

const createUserProgressZodSchema = z.object({
  body: z.object({
    userId: z.string({
      message: 'User ID is required',
    }),
    date: z
      .string({
        message: 'Date is required',
      })
      .datetime(), // Assuming date is passed as a datetime string
    ieltsScore: z.number().optional(),
    interviewScore: z.number().optional(),
    quizScore: z.number().optional(),
  }),
});

const updateUserProgressZodSchema = z.object({
  body: z.object({
    userId: z.string().optional(),
    date: z.string().datetime().optional(),
    ieltsScore: z.number().optional(),
    interviewScore: z.number().optional(),
    quizScore: z.number().optional(),
  }),
});

export const UserProgressValidation = {
  createUserProgressZodSchema,
  updateUserProgressZodSchema,
};

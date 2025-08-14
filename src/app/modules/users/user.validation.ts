import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(6),
    avatarUrl: z.string().url().optional(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

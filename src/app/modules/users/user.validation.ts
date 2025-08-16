import { z } from 'zod';

export const createUserZodSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(6),
    avatarUrl: z.string().url().optional(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  }),
});

export const loginUserZodSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const getAllUsersZodSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  getAllUsersZodSchema,
};
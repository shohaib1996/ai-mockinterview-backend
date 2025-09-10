import { QuizAttempt } from '@prisma/client';

export type IQuizAttempt = QuizAttempt;

export interface ICreateQuizAttemptPayload {
  userId: string;
  quizName: string;
  startedAt?: Date;
  endedAt?: Date;
  score?: number;
  feedback?: any; // Prisma's Json type maps to 'any' in TypeScript
}

export type IUpdateQuizAttemptPayload = Partial<ICreateQuizAttemptPayload>;

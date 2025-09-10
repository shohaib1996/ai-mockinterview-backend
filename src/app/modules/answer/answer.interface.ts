import { Answer } from '@prisma/client';

export type IAnswer = Answer;

export interface ICreateAnswerPayload {
  sessionId: string;
  questionId: string;
  answerText?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: any; // Prisma's Json type maps to 'any' in TypeScript
}

export type IUpdateAnswerPayload = Partial<ICreateAnswerPayload>;

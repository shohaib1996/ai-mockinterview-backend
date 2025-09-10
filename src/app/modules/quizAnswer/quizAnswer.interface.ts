import { QuizAnswer } from '@prisma/client';

export type IQuizAnswer = QuizAnswer;

export interface ICreateQuizAnswerPayload {
  quizAttemptId: string;
  questionId: string;
  selectedOption?: string;
  answerText?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: any; // Prisma's Json type maps to 'any' in TypeScript
}

export type IUpdateQuizAnswerPayload = Partial<ICreateQuizAnswerPayload>;

import { WritingSubmission } from '@prisma/client';

export type IWritingSubmission = WritingSubmission;

export interface ICreateWritingSubmissionPayload {
  userId: string;
  sessionId: string | null;
  writingTaskId: string;
  extractedText: string | null;
  score: number | null;
  feedback: any | null; // Prisma's Json type maps to 'any' in TypeScript
}

export type IUpdateWritingSubmissionPayload = Partial<ICreateWritingSubmissionPayload>;

export interface IWritingSubmissionFilters {
  userId?: string;
  sessionId?: string;
  page?: number;
  limit?: number;
}

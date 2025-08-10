import { WritingSubmission, IELTSWritingTask } from '@prisma/client';

export type IWritingSubmission = WritingSubmission;

export type ICreateWritingSubmissionPayload = {
  userId: string;
  sessionId?: string;
  writingTask: IELTSWritingTask;
  imageUrl: string;
  extractedText?: string;
  score?: number;
  feedback?: any; // Prisma's Json type maps to 'any' in TypeScript
};

export type IUpdateWritingSubmissionPayload = Partial<ICreateWritingSubmissionPayload>;
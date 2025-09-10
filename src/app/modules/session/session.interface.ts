import { Session, SessionType } from '@prisma/client';

export type ISession = Session;

export interface ICreateSessionPayload {
  type: SessionType;
  startedAt?: Date;
  endedAt?: Date;
  score?: number;
  transcript?: string;
  feedback?: any; // Prisma's Json type maps to 'any' in TypeScript
}

export type IUpdateSessionPayload = Partial<ICreateSessionPayload>;

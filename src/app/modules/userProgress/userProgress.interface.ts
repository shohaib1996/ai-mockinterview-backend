import { UserProgress } from '@prisma/client';

export type IUserProgress = UserProgress;

export type ICreateUserProgressPayload = {
  userId: string;
  date: Date;
  ieltsScore?: number;
  interviewScore?: number;
  quizScore?: number;
};

export type IUpdateUserProgressPayload = Partial<ICreateUserProgressPayload>;
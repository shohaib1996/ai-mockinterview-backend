import { ReadingPassage, Question } from '@prisma/client';

export type IReadingPassage = ReadingPassage;

export type ICreateReadingPassagePayload = {
  title: string;
  content: string;
};

export type IUpdateReadingPassagePayload = Partial<ICreateReadingPassagePayload>;
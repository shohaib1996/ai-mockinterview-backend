import { Question, QuestionType, SessionType, Difficulty } from '@prisma/client';

export type IQuestion = Question;

export type ICreateQuestionPayload = {
  type: QuestionType;
  sessionType: SessionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  aiGenerated?: boolean;
  listeningAudioId?: string;
  readingPassageId?: string;
};

export type IUpdateQuestionPayload = Partial<ICreateQuestionPayload>;

export type IQuestionFilters = {
  sessionType?: SessionType;
  listeningAudioId?: string;
  readingPassageId?: string;
};
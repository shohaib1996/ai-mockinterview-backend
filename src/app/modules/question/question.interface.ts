import { Question, QuestionType, SessionType, Difficulty } from '@prisma/client';

export type IQuestion = Question;

export interface ICreateQuestionPayload {
  type: QuestionType;
  sessionType: SessionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  difficulty?: Difficulty;
  aiGenerated?: boolean;
  listeningAudioId?: string;
  readingPassageId?: string;
  quizAttemptId?: string;
}

export type IUpdateQuestionPayload = Partial<ICreateQuestionPayload>;

export interface IQuestionFilters {
  sessionType?: SessionType;
  listeningAudioId?: string;
  readingPassageId?: string;
  page?: number;
  limit?: number;
  quizAttemptId?: string;
}

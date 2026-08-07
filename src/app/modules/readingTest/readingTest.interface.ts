import { Difficulty, QuestionType } from '@prisma/client';

export interface IGeneratedQuestion {
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  difficulty?: Difficulty;
}

export interface IGeneratedPassage {
  order: number;
  title: string;
  content: string;
  questions: IGeneratedQuestion[];
}

export interface IGeneratedReadingTest {
  title: string;
  passages: IGeneratedPassage[];
}

export interface ISubmitReadingAnswer {
  questionId: string;
  answerText: string;
}

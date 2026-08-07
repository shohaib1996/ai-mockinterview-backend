import { Difficulty, ListeningContext, QuestionType } from '@prisma/client';

export interface IGeneratedQuestion {
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  difficulty?: Difficulty;
}

export interface IScriptLine {
  speaker: string;
  text: string;
}

export interface IGeneratedSection {
  order: number;
  title: string;
  context: ListeningContext;
  script: IScriptLine[];
  questions: IGeneratedQuestion[];
}

export interface IGeneratedListeningTest {
  title: string;
  sections: IGeneratedSection[];
}

export interface ISubmitListeningAnswer {
  questionId: string;
  answerText: string;
}

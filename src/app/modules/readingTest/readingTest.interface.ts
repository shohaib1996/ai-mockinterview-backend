import { Difficulty, QuestionType } from '@prisma/client';
import { IDiagramSpec } from '@/app/utils/diagramRenderer';

export interface IGeneratedQuestion {
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  difficulty?: Difficulty;
  // Only set for DIAGRAM_LABEL questions - which numbered blank on the
  // passage's diagram this question is asking about.
  blankNumber?: number;
}

export interface IGeneratedPassage {
  order: number;
  title: string;
  content: string;
  questions: IGeneratedQuestion[];
  // Present only when this passage includes a diagram-labeling question group.
  diagram?: IDiagramSpec;
}

export interface IGeneratedReadingTest {
  title: string;
  passages: IGeneratedPassage[];
}

export interface ISubmitReadingAnswer {
  questionId: string;
  answerText: string;
}

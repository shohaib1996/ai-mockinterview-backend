import { QuestionType } from '@prisma/client';

const VALID_QUESTION_TYPES = new Set(Object.values(QuestionType) as string[]);

// AI-generated question objects occasionally come back with a field in the
// wrong shape (e.g. correctAnswer as an array instead of a string), which
// Prisma only catches at insert time - by then TTS audio may already have
// been synthesized for nothing. Catch it right after parsing instead, so a
// malformed generation gets rejected/retried like a wrong question count.
export const validateGeneratedQuestions = (questions: unknown, context: string): void => {
  if (!Array.isArray(questions)) {
    throw new Error(`${context}: questions is not an array`);
  }

  questions.forEach((raw, index) => {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error(`${context}: question ${index + 1} is not an object`);
    }
    const question = raw as Record<string, unknown>;
    const label = `${context}: question ${index + 1}`;

    if (typeof question.type !== 'string' || !VALID_QUESTION_TYPES.has(question.type)) {
      throw new Error(`${label} has invalid type "${String(question.type)}"`);
    }
    if (typeof question.text !== 'string' || question.text.trim().length === 0) {
      throw new Error(`${label} has missing/empty text`);
    }
    if (question.correctAnswer !== undefined && typeof question.correctAnswer !== 'string') {
      throw new Error(`${label} has a non-string correctAnswer: ${JSON.stringify(question.correctAnswer)}`);
    }
    if (
      question.options !== undefined &&
      (!Array.isArray(question.options) || question.options.some((o) => typeof o !== 'string'))
    ) {
      throw new Error(`${label} has a malformed options array`);
    }
    if (
      question.acceptableAnswers !== undefined &&
      (!Array.isArray(question.acceptableAnswers) ||
        question.acceptableAnswers.some((a) => typeof a !== 'string'))
    ) {
      throw new Error(`${label} has a malformed acceptableAnswers array`);
    }
  });
};

import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { Difficulty, SessionType } from '@prisma/client';
import { ReadingTestGenerator } from './readingTest.generator';
import { AnswerServices } from '../answer/answer.services';
import { rawScoreToReadingBand } from '@/app/utils/bandConversion';
import { ISubmitReadingAnswer } from './readingTest.interface';

const readingTestInclude = {
  passages: {
    orderBy: { order: 'asc' as const },
    include: { questions: true },
  },
};

const assignReadingTest = async (userId: string) => {
  const completedTestIds = (
    await prisma.session.findMany({
      where: {
        userId,
        type: SessionType.IELTS_READING,
        readingTestId: { not: null },
        endedAt: { not: null },
      },
      select: { readingTestId: true },
    })
  ).map((s) => s.readingTestId as string);

  let readingTest = await prisma.readingTest.findFirst({
    where: { id: { notIn: completedTestIds } },
    include: readingTestInclude,
  });

  if (!readingTest) {
    const generated = await ReadingTestGenerator.generateReadingTest('MEDIUM');
    readingTest = await prisma.readingTest.findUniqueOrThrow({
      where: { id: generated.id },
      include: readingTestInclude,
    });
  }

  const session = await prisma.session.create({
    data: {
      userId,
      type: SessionType.IELTS_READING,
      readingTestId: readingTest.id,
    },
  });

  return { session, readingTest };
};

const getReadingTestBySession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }
  if (!session.readingTestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no reading test assigned');
  }

  const readingTest = await prisma.readingTest.findUniqueOrThrow({
    where: { id: session.readingTestId },
    include: readingTestInclude,
  });

  return { session, readingTest };
};

const submitReadingTest = async (
  sessionId: string,
  userId: string,
  answers: ISubmitReadingAnswer[],
) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }
  if (!session.readingTestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no reading test assigned');
  }
  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This reading test has already been submitted');
  }

  const questions = await prisma.question.findMany({
    where: { readingPassage: { readingTestId: session.readingTestId } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const answerRows = answers.map((a) => {
    const question = questionMap.get(a.questionId);
    if (!question) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Unknown question: ${a.questionId}`);
    }
    const isCorrect = AnswerServices.gradeObjectiveAnswer(question, a.answerText);
    return {
      sessionId,
      questionId: a.questionId,
      answerText: a.answerText,
      isCorrect,
      score: isCorrect ? 1 : 0,
    };
  });

  await prisma.answer.createMany({ data: answerRows });

  const rawScore = answerRows.filter((a) => a.isCorrect).length;
  const totalQuestions = questions.length;
  const band = rawScoreToReadingBand(rawScore, totalQuestions);

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: { score: band, endedAt: new Date() },
  });

  return { rawScore, totalQuestions, band, session: updatedSession };
};

// Manual, admin-triggered - always generates exactly one new test, with no
// ceiling. There's no automatic replenishment anymore (no cron, and the
// live per-user fallback in assignReadingTest generates its own on demand),
// so there's nothing left for a pool floor to protect against.
const generateOne = async (difficulty: Difficulty) => {
  try {
    await ReadingTestGenerator.generateReadingTest(difficulty);
    await prisma.generationLog.create({
      data: { skill: SessionType.IELTS_READING, difficulty, status: 'SUCCESS' },
    });
    return { generated: 1 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await prisma.generationLog.create({
      data: {
        skill: SessionType.IELTS_READING,
        difficulty,
        status: 'FAILED',
        errorMessage: message.slice(0, 500),
      },
    });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to generate reading test: ${message}`);
  }
};

export const ReadingTestServices = {
  assignReadingTest,
  getReadingTestBySession,
  submitReadingTest,
  generateOne,
};

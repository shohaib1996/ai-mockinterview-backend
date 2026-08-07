import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { Difficulty, SessionType } from '@prisma/client';
import { ListeningTestGenerator } from './listeningTest.generator';
import { AnswerServices } from '../answer/answer.services';
import { rawScoreToListeningBand } from '@/app/utils/bandConversion';
import { ISubmitListeningAnswer } from './listeningTest.interface';

const MIN_POOL_SIZE_PER_DIFFICULTY = 5;

const listeningTestInclude = {
  sections: {
    orderBy: { order: 'asc' as const },
    include: { questions: true },
  },
};

const assignListeningTest = async (userId: string) => {
  const completedTestIds = (
    await prisma.session.findMany({
      where: {
        userId,
        type: SessionType.IELTS_LISTENING,
        listeningTestId: { not: null },
        endedAt: { not: null },
      },
      select: { listeningTestId: true },
    })
  ).map((s) => s.listeningTestId as string);

  let listeningTest = await prisma.listeningTest.findFirst({
    where: { id: { notIn: completedTestIds } },
    include: listeningTestInclude,
  });

  if (!listeningTest) {
    const generated = await ListeningTestGenerator.generateListeningTest('MEDIUM');
    listeningTest = await prisma.listeningTest.findUniqueOrThrow({
      where: { id: generated.id },
      include: listeningTestInclude,
    });
  }

  const session = await prisma.session.create({
    data: {
      userId,
      type: SessionType.IELTS_LISTENING,
      listeningTestId: listeningTest.id,
    },
  });

  return { session, listeningTest };
};

const getListeningTestBySession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }
  if (!session.listeningTestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no listening test assigned');
  }

  const listeningTest = await prisma.listeningTest.findUniqueOrThrow({
    where: { id: session.listeningTestId },
    include: listeningTestInclude,
  });

  return { session, listeningTest };
};

const submitListeningTest = async (
  sessionId: string,
  userId: string,
  answers: ISubmitListeningAnswer[],
) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }
  if (!session.listeningTestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no listening test assigned');
  }
  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This listening test has already been submitted');
  }

  const questions = await prisma.question.findMany({
    where: { listeningAudio: { listeningTestId: session.listeningTestId } },
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
  const band = rawScoreToListeningBand(rawScore, totalQuestions);

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: { score: band, endedAt: new Date() },
  });

  return { rawScore, totalQuestions, band, session: updatedSession };
};

const ensurePool = async (difficulty: Difficulty) => {
  const count = await prisma.listeningTest.count({ where: { difficulty } });
  if (count >= MIN_POOL_SIZE_PER_DIFFICULTY) {
    return { alreadySufficient: true, generated: 0 };
  }

  const toGenerate = MIN_POOL_SIZE_PER_DIFFICULTY - count;
  let generated = 0;

  for (let i = 0; i < toGenerate; i++) {
    try {
      await ListeningTestGenerator.generateListeningTest(difficulty);
      await prisma.generationLog.create({
        data: { skill: SessionType.IELTS_LISTENING, difficulty, status: 'SUCCESS' },
      });
      generated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await prisma.generationLog.create({
        data: {
          skill: SessionType.IELTS_LISTENING,
          difficulty,
          status: 'FAILED',
          errorMessage: message.slice(0, 500),
        },
      });
    }
  }

  return { alreadySufficient: false, generated };
};

export const ListeningTestServices = {
  assignListeningTest,
  getListeningTestBySession,
  submitListeningTest,
  ensurePool,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ReadingTestServices } from '@/app/modules/readingTest/readingTest.services';
import { ListeningTestServices } from '@/app/modules/listeningTest/listeningTest.services';
import { WritingTestServices } from '@/app/modules/writingTest/writingTest.services';
import { SpeakingTestServices } from '@/app/modules/speakingTest/speakingTest.services';
import { ContentPoolServices } from './contentPool.services';
import { Difficulty, SessionType } from '@prisma/client';

const getPoolStatus = catchAsync(async (req: Request, res: Response) => {
  const readingCounts = await prisma.readingTest.groupBy({
    by: ['difficulty'],
    _count: { _all: true },
  });
  const listeningCounts = await prisma.listeningTest.groupBy({
    by: ['difficulty'],
    _count: { _all: true },
  });
  const writingCounts = await prisma.writingTask.groupBy({
    by: ['difficulty', 'task'],
    _count: { _all: true },
    where: { difficulty: { not: null } },
  });
  const speakingCounts = await prisma.speakingTest.groupBy({
    by: ['difficulty'],
    _count: { _all: true },
  });
  const recentLogs = await prisma.generationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Content pool status retrieved',
    data: {
      reading: readingCounts.map((c) => ({ difficulty: c.difficulty, count: c._count._all })),
      listening: listeningCounts.map((c) => ({ difficulty: c.difficulty, count: c._count._all })),
      writing: writingCounts.map((c) => ({
        difficulty: c.difficulty,
        task: c.task,
        count: c._count._all,
      })),
      speaking: speakingCounts.map((c) => ({ difficulty: c.difficulty, count: c._count._all })),
      recentLogs,
    },
  });
});

const generateNow = catchAsync(async (req: Request, res: Response) => {
  const { skill, difficulty } = req.body as { skill: SessionType; difficulty?: Difficulty };

  if (skill === SessionType.IELTS_READING) {
    const result = await ReadingTestServices.generateOne(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Reading test generated',
      data: result,
    });
  }

  if (skill === SessionType.IELTS_LISTENING) {
    const result = await ListeningTestServices.generateOne(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Listening test generated',
      data: result,
    });
  }

  if (skill === SessionType.IELTS_WRITING) {
    const result = await WritingTestServices.generateOne(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Writing test generated',
      data: result,
    });
  }

  if (skill === SessionType.IELTS_SPEAKING) {
    const result = await SpeakingTestServices.generateOne(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Speaking test generated',
      data: result,
    });
  }

  throw new ApiError(httpStatus.BAD_REQUEST, `Generation for ${skill} is not available yet`);
});

const getTests = catchAsync(async (req: Request, res: Response) => {
  const { skill } = req.params;
  const { page, limit, difficulty } = req.query as {
    page?: string;
    limit?: string;
    difficulty?: Difficulty;
  };

  const result = await ContentPoolServices.listTests(skill as SessionType, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    difficulty,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Tests retrieved',
    ...result,
  });
});

const deleteTest = catchAsync(async (req: Request, res: Response) => {
  const { skill, id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Test ID is required');
  }
  await ContentPoolServices.deleteTest(skill as SessionType, id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Test deleted',
    data: null,
  });
});

export const ContentPoolController = { getPoolStatus, generateNow, getTests, deleteTest };

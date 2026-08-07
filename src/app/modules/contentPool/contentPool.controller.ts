import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ReadingTestServices } from '@/app/modules/readingTest/readingTest.services';
import { ListeningTestServices } from '@/app/modules/listeningTest/listeningTest.services';
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
      recentLogs,
    },
  });
});

const generateNow = catchAsync(async (req: Request, res: Response) => {
  const { skill, difficulty } = req.body as { skill: SessionType; difficulty?: Difficulty };

  if (skill === SessionType.IELTS_READING) {
    const result = await ReadingTestServices.ensurePool(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Reading pool generation triggered',
      data: result,
    });
  }

  if (skill === SessionType.IELTS_LISTENING) {
    const result = await ListeningTestServices.ensurePool(difficulty ?? 'MEDIUM');
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Listening pool generation triggered',
      data: result,
    });
  }

  throw new ApiError(httpStatus.BAD_REQUEST, `Generation for ${skill} is not available yet`);
});

export const ContentPoolController = { getPoolStatus, generateNow };

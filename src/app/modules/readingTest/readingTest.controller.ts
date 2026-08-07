import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { ReadingTestServices } from './readingTest.services';
import { ApiError } from '@/app/errors/apiError';
import { User } from '@prisma/client';

const startReadingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const result = await ReadingTestServices.assignReadingTest(userId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Reading test started',
    data: result,
  });
});

const getReadingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await ReadingTestServices.getReadingTestBySession(sessionId, userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading test retrieved',
    data: result,
  });
});

const submitReadingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const { answers } = req.body;
  const result = await ReadingTestServices.submitReadingTest(sessionId, userId, answers);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading test submitted',
    data: result,
  });
});

export const ReadingTestController = { startReadingTest, getReadingTest, submitReadingTest };

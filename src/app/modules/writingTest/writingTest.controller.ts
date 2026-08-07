import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { WritingTestServices } from './writingTest.services';
import { ApiError } from '@/app/errors/apiError';
import { User } from '@prisma/client';

const startWritingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const result = await WritingTestServices.assignWritingTest(userId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Writing test started',
    data: result,
  });
});

const getWritingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await WritingTestServices.getWritingTestBySession(sessionId, userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing test retrieved',
    data: result,
  });
});

const submitWritingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const { task1Text, task2Text } = req.body;
  const result = await WritingTestServices.submitWritingTest(sessionId, userId, {
    task1Text,
    task2Text,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing test submitted',
    data: result,
  });
});

export const WritingTestController = { startWritingTest, getWritingTest, submitWritingTest };

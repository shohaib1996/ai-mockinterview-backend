import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { ListeningTestServices } from './listeningTest.services';
import { ApiError } from '@/app/errors/apiError';
import { User } from '@prisma/client';

const startListeningTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const result = await ListeningTestServices.assignListeningTest(userId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Listening test started',
    data: result,
  });
});

const getListeningTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await ListeningTestServices.getListeningTestBySession(sessionId, userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening test retrieved',
    data: result,
  });
});

const submitListeningTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const { answers } = req.body;
  const result = await ListeningTestServices.submitListeningTest(sessionId, userId, answers);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening test submitted',
    data: result,
  });
});

export const ListeningTestController = { startListeningTest, getListeningTest, submitListeningTest };

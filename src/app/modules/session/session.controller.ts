import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { SessionServices } from './session.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

import { User } from '@prisma/client';

const createSessionController = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const result = await SessionServices.createSession(userId, req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Session created successfully',
    data: result,
  });
});

const getAllSessionsController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, userId, type } = req.query;
  const options: { page?: number; limit?: number; userId?: string; type?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (userId) options.userId = userId as string;
  if (type) options.type = type as string;

  const result = await SessionServices.getAllSessions(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Sessions retrieved successfully',
    ...result,
  });
});

const getSingleSessionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await SessionServices.getSingleSession(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Session retrieved successfully',
    data: result,
  });
});

const updateSessionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await SessionServices.updateSession(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Session updated successfully',
    data: result,
  });
});

const deleteSessionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await SessionServices.deleteSession(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Session deleted successfully',
    data: result,
  });
});

export const SessionController = {
  createSessionController,
  getAllSessionsController,
  getSingleSessionController,
  updateSessionController,
  deleteSessionController,
};

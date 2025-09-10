import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { UserProgressServices } from './userProgress.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createUserProgressController = catchAsync(async (req: Request, res: Response) => {
  const result = await UserProgressServices.createUserProgress(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User progress created successfully',
    data: result,
  });
});

const getAllUserProgressController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, userId } = req.query;
  const options: { page?: number; limit?: number; userId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (userId) options.userId = userId as string;

  const result = await UserProgressServices.getAllUserProgress(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User progress records retrieved successfully',
    ...result,
  });
});

const getSingleUserProgressController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Progress ID is required');
  }
  const result = await UserProgressServices.getSingleUserProgress(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User progress not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'User progress retrieved successfully',
    data: result,
  });
});

const updateUserProgressController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Progress ID is required');
  }
  const result = await UserProgressServices.updateUserProgress(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User progress updated successfully',
    data: result,
  });
});

const deleteUserProgressController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Progress ID is required');
  }
  const result = await UserProgressServices.deleteUserProgress(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User progress deleted successfully',
    data: result,
  });
});

export const UserProgressController = {
  createUserProgressController,
  getAllUserProgressController,
  getSingleUserProgressController,
  updateUserProgressController,
  deleteUserProgressController,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { QuizAttemptServices } from './quizAttempt.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createQuizAttemptController = catchAsync(async (req: Request, res: Response) => {
  const result = await QuizAttemptServices.createQuizAttempt(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Quiz attempt created successfully',
    data: result,
  });
});

const getAllQuizAttemptsController = catchAsync(async (req: Request, res: Response) => {
  const result = await QuizAttemptServices.getAllQuizAttempts();
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz attempts retrieved successfully',
    data: result,
  });
});

const getSingleQuizAttemptController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Attempt ID is required');
  }
  const result = await QuizAttemptServices.getSingleQuizAttempt(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz attempt not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz attempt retrieved successfully',
    data: result,
  });
});

const updateQuizAttemptController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Attempt ID is required');
  }
  const result = await QuizAttemptServices.updateQuizAttempt(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz attempt updated successfully',
    data: result,
  });
});

const deleteQuizAttemptController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Attempt ID is required');
  }
  const result = await QuizAttemptServices.deleteQuizAttempt(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz attempt deleted successfully',
    data: result,
  });
});

export const QuizAttemptController = {
  createQuizAttemptController,
  getAllQuizAttemptsController,
  getSingleQuizAttemptController,
  updateQuizAttemptController,
  deleteQuizAttemptController,
};
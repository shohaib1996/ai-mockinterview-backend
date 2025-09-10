import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { QuizAnswerServices } from './quizAnswer.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createQuizAnswerController = catchAsync(async (req: Request, res: Response) => {
  const result = await QuizAnswerServices.createQuizAnswer(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Quiz answer created successfully',
    data: result,
  });
});

const getAllQuizAnswersController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, quizAttemptId } = req.query;
  const options: { page?: number; limit?: number; quizAttemptId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (quizAttemptId) options.quizAttemptId = quizAttemptId as string;

  const result = await QuizAnswerServices.getAllQuizAnswers(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz answers retrieved successfully',
    ...result,
  });
});

const getSingleQuizAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Answer ID is required');
  }
  const result = await QuizAnswerServices.getSingleQuizAnswer(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Quiz answer not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz answer retrieved successfully',
    data: result,
  });
});

const updateQuizAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Answer ID is required');
  }
  const result = await QuizAnswerServices.updateQuizAnswer(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz answer updated successfully',
    data: result,
  });
});

const deleteQuizAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Quiz Answer ID is required');
  }
  const result = await QuizAnswerServices.deleteQuizAnswer(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Quiz answer deleted successfully',
    data: result,
  });
});

export const QuizAnswerController = {
  createQuizAnswerController,
  getAllQuizAnswersController,
  getSingleQuizAnswerController,
  updateQuizAnswerController,
  deleteQuizAnswerController,
};

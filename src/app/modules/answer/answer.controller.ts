import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AnswerServices } from './answer.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createAnswerController = catchAsync(async (req: Request, res: Response) => {
  const result = await AnswerServices.createAnswer(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Answer created successfully',
    data: result,
  });
});

const getAllAnswersController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, sessionId } = req.query;
  const options: { page?: number; limit?: number; sessionId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (sessionId) options.sessionId = sessionId as string;

  const result = await AnswerServices.getAllAnswers(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Answers retrieved successfully',
    ...result,
  });
});

const getSingleAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Answer ID is required');
  }
  const result = await AnswerServices.getSingleAnswer(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Answer not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Answer retrieved successfully',
    data: result,
  });
});

const updateAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Answer ID is required');
  }
  const result = await AnswerServices.updateAnswer(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Answer updated successfully',
    data: result,
  });
});

const deleteAnswerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Answer ID is required');
  }
  const result = await AnswerServices.deleteAnswer(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Answer deleted successfully',
    data: result,
  });
});

export const AnswerController = {
  createAnswerController,
  getAllAnswersController,
  getSingleAnswerController,
  updateAnswerController,
  deleteAnswerController,
};

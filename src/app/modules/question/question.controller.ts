import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { QuestionServices } from './question.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';
import { IQuestionFilters } from './question.interface';

const createQuestionController = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionServices.createQuestion(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Question created successfully',
    data: result,
  });
});

const getAllQuestionsController = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as IQuestionFilters;
  const result = await QuestionServices.getAllQuestions(filters);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Questions retrieved successfully',
    data: result,
  });
});

const getSingleQuestionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Question ID is required');
  }
  const result = await QuestionServices.getSingleQuestion(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Question retrieved successfully',
    data: result,
  });
});

const updateQuestionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Question ID is required');
  }
  const result = await QuestionServices.updateQuestion(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Question updated successfully',
    data: result,
  });
});

const deleteQuestionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Question ID is required');
  }
  const result = await QuestionServices.deleteQuestion(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Question deleted successfully',
    data: result,
  });
});

export const QuestionController = {
  createQuestionController,
  getAllQuestionsController,
  getSingleQuestionController,
  updateQuestionController,
  deleteQuestionController,
};
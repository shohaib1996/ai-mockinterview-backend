import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { QuestionServices } from './question.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';
import { SessionType } from '@prisma/client';
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
  const { sessionType, listeningAudioId, readingPassageId, quizAttemptId, page, limit } = req.query;
  const filters: IQuestionFilters = {};

  if (page) filters.page = Number(page);
  if (limit) filters.limit = Number(limit);
  if (sessionType) filters.sessionType = sessionType as SessionType;
  if (listeningAudioId) filters.listeningAudioId = listeningAudioId as string;
  if (readingPassageId) filters.readingPassageId = readingPassageId as string;
  if (quizAttemptId) filters.quizAttemptId = quizAttemptId as string;

  const result = await QuestionServices.getAllQuestions(filters);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Questions retrieved successfully',
    ...result,
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

const generateQuestionsController = catchAsync(async (req: Request, res: Response) => {
  const {
    promptText,
    numberOfQuestions,
    sessionType,
    listeningAudioId,
    readingPassageId,
    quizAttemptId,
  } = req.body;
  const generatedQuestions = await QuestionServices.generateQuestions(
    promptText,
    numberOfQuestions,
    sessionType,
    listeningAudioId,
    readingPassageId,
    quizAttemptId,
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Questions generated successfully',
    data: generatedQuestions,
  });
});

export const QuestionController = {
  createQuestionController,
  getAllQuestionsController,
  getSingleQuestionController,
  updateQuestionController,
  deleteQuestionController,
  generateQuestionsController,
};

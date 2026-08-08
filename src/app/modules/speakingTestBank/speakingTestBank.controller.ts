import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { SpeakingTestBankServices } from './speakingTestBank.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';
import { Difficulty } from '@prisma/client';

const createSpeakingTestController = catchAsync(async (req: Request, res: Response) => {
  const result = await SpeakingTestBankServices.createSpeakingTest(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Speaking test created successfully',
    data: result,
  });
});

const getAllSpeakingTestsController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, difficulty } = req.query;
  const options: { page?: number; limit?: number; difficulty?: Difficulty } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (difficulty) options.difficulty = difficulty as Difficulty;

  const result = await SpeakingTestBankServices.getAllSpeakingTests(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking tests retrieved successfully',
    ...result,
  });
});

const getSingleSpeakingTestController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Speaking test ID is required');
  }
  const result = await SpeakingTestBankServices.getSingleSpeakingTest(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Speaking test not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking test retrieved successfully',
    data: result,
  });
});

const updateSpeakingTestController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Speaking test ID is required');
  }
  const result = await SpeakingTestBankServices.updateSpeakingTest(id, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking test updated successfully',
    data: result,
  });
});

const deleteSpeakingTestController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Speaking test ID is required');
  }
  const result = await SpeakingTestBankServices.deleteSpeakingTest(id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking test deleted successfully',
    data: result,
  });
});

export const SpeakingTestBankController = {
  createSpeakingTestController,
  getAllSpeakingTestsController,
  getSingleSpeakingTestController,
  updateSpeakingTestController,
  deleteSpeakingTestController,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ReadingPassageServices } from './readingPassage.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createReadingPassageController = catchAsync(async (req: Request, res: Response) => {
  const result = await ReadingPassageServices.createReadingPassage(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Reading passage created successfully',
    data: result,
  });
});

const getAllReadingPassagesController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const options: { page?: number; limit?: number; userId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (req.user) {
    options.userId = req.user.id;
  }

  const result = await ReadingPassageServices.getAllReadingPassages(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading passages retrieved successfully',
    ...result,
  });
});

const getSingleReadingPassageController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading Passage ID is required');
  }
  const result = await ReadingPassageServices.getSingleReadingPassage(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reading passage not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading passage retrieved successfully',
    data: result,
  });
});

const updateReadingPassageController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading Passage ID is required');
  }
  const result = await ReadingPassageServices.updateReadingPassage(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading passage updated successfully',
    data: result,
  });
});

const deleteReadingPassageController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reading Passage ID is required');
  }
  const result = await ReadingPassageServices.deleteReadingPassage(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Reading passage deleted successfully',
    data: result,
  });
});

export const ReadingPassageController = {
  createReadingPassageController,
  getAllReadingPassagesController,
  getSingleReadingPassageController,
  updateReadingPassageController,
  deleteReadingPassageController,
};

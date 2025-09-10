import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { WritingSubmissionServices } from './writingSubmission.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createWritingSubmissionController = catchAsync(async (req: Request, res: Response) => {
  const result = await WritingSubmissionServices.createWritingSubmission(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Writing submission created successfully',
    data: result,
  });
});

const getAllWritingSubmissionsController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, userId, sessionId } = req.query;
  const options: { page?: number; limit?: number; userId?: string; sessionId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (userId) options.userId = userId as string;
  if (sessionId) options.sessionId = sessionId as string;

  const result = await WritingSubmissionServices.getAllWritingSubmissions(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing submissions retrieved successfully',
    ...result,
  });
});

const getSingleWritingSubmissionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Submission ID is required');
  }
  const result = await WritingSubmissionServices.getSingleWritingSubmission(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Writing submission not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing submission retrieved successfully',
    data: result,
  });
});

const updateWritingSubmissionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Submission ID is required');
  }
  const result = await WritingSubmissionServices.updateWritingSubmission(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing submission updated successfully',
    data: result,
  });
});

const deleteWritingSubmissionController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Submission ID is required');
  }
  const result = await WritingSubmissionServices.deleteWritingSubmission(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing submission deleted successfully',
    data: result,
  });
});

export const WritingSubmissionController = {
  createWritingSubmissionController,
  getAllWritingSubmissionsController,
  getSingleWritingSubmissionController,
  updateWritingSubmissionController,
  deleteWritingSubmissionController,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { WritingTaskServices } from './writingTask.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';
import { Difficulty, IELTSWritingTaskType } from '@prisma/client';

const createWritingTaskController = catchAsync(async (req: Request, res: Response) => {
  const result = await WritingTaskServices.createWritingTask(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Writing task created successfully',
    data: result,
  });
});

const getAllWritingTasksController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, task, difficulty } = req.query;
  const options: {
    page?: number;
    limit?: number;
    task?: IELTSWritingTaskType;
    difficulty?: Difficulty;
  } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);
  if (task) options.task = task as IELTSWritingTaskType;
  if (difficulty) options.difficulty = difficulty as Difficulty;

  const result = await WritingTaskServices.getAllWritingTasks(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing tasks retrieved successfully',
    ...result,
  });
});

const getSingleWritingTaskController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Task ID is required');
  }
  const result = await WritingTaskServices.getSingleWritingTask(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Writing task not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing task retrieved successfully',
    data: result,
  });
});

const updateWritingTaskController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Task ID is required');
  }
  const result = await WritingTaskServices.updateWritingTask(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing task updated successfully',
    data: result,
  });
});

const deleteWritingTaskController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Writing Task ID is required');
  }
  const result = await WritingTaskServices.deleteWritingTask(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Writing task deleted successfully',
    data: result,
  });
});

export const WritingTaskController = {
  createWritingTaskController,
  getAllWritingTasksController,
  getSingleWritingTaskController,
  updateWritingTaskController,
  deleteWritingTaskController,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ListeningAudioServices } from './listeningAudio.services';
import catchAsync from '@/app/utils/catchAsync';
import { ApiError } from '@/app/errors/apiError';

const createListeningAudioController = catchAsync(async (req: Request, res: Response) => {
  const result = await ListeningAudioServices.createListeningAudio(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Listening audio created successfully',
    data: result,
  });
});

const getAllListeningAudiosController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const options: { page?: number; limit?: number; userId?: string } = {};

  if (page) options.page = Number(page);
  if (limit) options.limit = Number(limit);

  if (req.user && req.user.id) {
    options.userId = req.user.id;
  }

  const result = await ListeningAudioServices.getAllListeningAudios(options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening audios retrieved successfully',
    ...result,
  });
});

const getSingleListeningAudioController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Listening Audio ID is required');
  }
  const result = await ListeningAudioServices.getSingleListeningAudio(id as string);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Listening audio not found');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening audio retrieved successfully',
    data: result,
  });
});

const updateListeningAudioController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Listening Audio ID is required');
  }
  const result = await ListeningAudioServices.updateListeningAudio(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening audio updated successfully',
    data: result,
  });
});

const deleteListeningAudioController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Listening Audio ID is required');
  }
  const result = await ListeningAudioServices.deleteListeningAudio(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Listening audio deleted successfully',
    data: result,
  });
});

export const ListeningAudioController = {
  createListeningAudioController,
  getAllListeningAudiosController,
  getSingleListeningAudioController,
  updateListeningAudioController,
  deleteListeningAudioController,
};

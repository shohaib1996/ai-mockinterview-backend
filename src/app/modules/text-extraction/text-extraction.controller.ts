import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ApiError } from '@/app/errors/apiError';

const client = new ImageAnnotatorClient();

const extractTextController = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded.');
  }

  const [result] = await client.textDetection(req.file.buffer);
  const text = result.fullTextAnnotation?.text || '';

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Text extracted successfully',
    data: text,
  });
});

export const TextExtractionController = {
  extractTextController,
};

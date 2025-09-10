import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { uploadToCloudinary } from '@/app/lib/multer';
import { ApiError } from '@/app/errors/apiError';

const uploadFileController = catchAsync(async (req: Request, res: Response) => {
  try {
    let urls: string[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      urls = results.map((result: any) => result.secure_url);
    } else if (req.file) {
      const result: any = await uploadToCloudinary(req.file);
      urls.push(result.secure_url);
    }

    if (urls.length > 0) {
      res.status(httpStatus.OK).json({
        success: true,
        message: 'Files uploaded successfully',
        data: urls,
      });
    } else {
      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No files were uploaded',
      });
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload files');
  }
});

export const FileUploadController = {
  uploadFileController,
};

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import config from '../config';
import { ApiError } from '../errors/apiError';
import httpStatus from 'http-status';

if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
} else {
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Cloudinary configuration is missing.');
}

const storage = multer.memoryStorage();

const photoFileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image files are allowed!'), false);
  }
};

const audioFileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only audio files are allowed!'), false);
  }
};

export const uploadPhoto = multer({
  storage: storage,
  fileFilter: photoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

const csvFileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only CSV files are allowed!'), false);
  }
};

export const uploadCsv = multer({
  storage: storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadToCloudinary = (file: any) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      })
      .end(file.buffer);
  });
};

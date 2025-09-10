import express from 'express';
import { uploadPhoto, uploadAudio } from '@/app/lib/multer';
import { FileUploadController } from './file-upload.controller';

const router = express.Router();

router.post('/photo', uploadPhoto.array('photos', 5), FileUploadController.uploadFileController);

router.post('/audio', uploadAudio.single('audio'), FileUploadController.uploadFileController);

export const FileUploadRoutes = router;

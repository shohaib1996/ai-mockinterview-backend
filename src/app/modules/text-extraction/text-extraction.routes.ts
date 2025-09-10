import express from 'express';
import { uploadPhoto } from '@/app/lib/multer';
import { TextExtractionController } from './text-extraction.controller';

const router = express.Router();

router.post('/', uploadPhoto.single('image'), TextExtractionController.extractTextController);

export const TextExtractionRoutes = router;

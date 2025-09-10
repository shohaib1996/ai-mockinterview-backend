import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { MockInterviewController } from './mock-interview.controller';
import { uploadCsv } from '@/app/lib/multer';

const router = express.Router();

router.post(
  '/:sessionId/upload-questions',
  auth([Role.USER, Role.ADMIN]),
  uploadCsv.single('file'),
  MockInterviewController.uploadQuestionsController,
);

router.post(
  '/:sessionId/chat',
  auth([Role.USER, Role.ADMIN]),
  MockInterviewController.chatController,
);

router.get(
  '/:sessionId/history',
  auth([Role.USER, Role.ADMIN]),
  MockInterviewController.getConversationHistoryController,
);

router.post(
  '/:sessionId/analyze',
  auth([Role.USER, Role.ADMIN]),
  MockInterviewController.analyzeConversationController,
);

export const MockInterviewRoutes = router;

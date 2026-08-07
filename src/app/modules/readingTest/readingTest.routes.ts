import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { ReadingTestController } from './readingTest.controller';

const router = express.Router();

router.post('/start', auth([Role.USER, Role.ADMIN]), ReadingTestController.startReadingTest);
router.post(
  '/:sessionId/submit',
  auth([Role.USER, Role.ADMIN]),
  ReadingTestController.submitReadingTest,
);

export const ReadingTestRoutes = router;

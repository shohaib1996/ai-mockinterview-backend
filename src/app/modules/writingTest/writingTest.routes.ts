import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { WritingTestController } from './writingTest.controller';

const router = express.Router();

router.post('/start', auth([Role.USER, Role.ADMIN]), WritingTestController.startWritingTest);
router.get('/:sessionId', auth([Role.USER, Role.ADMIN]), WritingTestController.getWritingTest);
router.post(
  '/:sessionId/submit',
  auth([Role.USER, Role.ADMIN]),
  WritingTestController.submitWritingTest,
);

export const WritingTestRoutes = router;

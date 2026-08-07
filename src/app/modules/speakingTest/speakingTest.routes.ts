import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { SpeakingTestController } from './speakingTest.controller';

const router = express.Router();

router.post('/start', auth([Role.USER, Role.ADMIN]), SpeakingTestController.startSpeakingTest);
router.get('/:sessionId', auth([Role.USER, Role.ADMIN]), SpeakingTestController.getSpeakingTest);
router.post('/:sessionId/chat', auth([Role.USER, Role.ADMIN]), SpeakingTestController.chat);
router.post(
  '/:sessionId/part2',
  auth([Role.USER, Role.ADMIN]),
  SpeakingTestController.submitPart2,
);
router.post(
  '/:sessionId/analyze',
  auth([Role.USER, Role.ADMIN]),
  SpeakingTestController.analyzeSpeakingTest,
);

export const SpeakingTestRoutes = router;

import express from 'express';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';
import { ListeningTestController } from './listeningTest.controller';

const router = express.Router();

router.post('/start', auth([Role.USER, Role.ADMIN]), ListeningTestController.startListeningTest);
router.get('/:sessionId', auth([Role.USER, Role.ADMIN]), ListeningTestController.getListeningTest);
router.post(
  '/:sessionId/submit',
  auth([Role.USER, Role.ADMIN]),
  ListeningTestController.submitListeningTest,
);

export const ListeningTestRoutes = router;

import express from 'express';
import { SpeakingTestBankController } from './speakingTestBank.controller';
import { SpeakingTestBankValidation } from './speakingTestBank.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.ADMIN]),
  validateRequest(SpeakingTestBankValidation.createSpeakingTestZodSchema),
  SpeakingTestBankController.createSpeakingTestController,
);

router.get('/', auth([Role.USER, Role.ADMIN]), SpeakingTestBankController.getAllSpeakingTestsController);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]),
  SpeakingTestBankController.getSingleSpeakingTestController,
);

router.patch(
  '/:id',
  auth([Role.ADMIN]),
  validateRequest(SpeakingTestBankValidation.updateSpeakingTestZodSchema),
  SpeakingTestBankController.updateSpeakingTestController,
);

router.delete('/:id', auth([Role.ADMIN]), SpeakingTestBankController.deleteSpeakingTestController);

export const SpeakingTestBankRoutes = router;

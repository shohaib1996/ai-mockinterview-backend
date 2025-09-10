import express from 'express';
import { ListeningAudioController } from './listeningAudio.controller';
import { ListeningAudioValidation } from './listeningAudio.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.ADMIN]), // Only ADMIN can create
  validateRequest(ListeningAudioValidation.createListeningAudioZodSchema),
  ListeningAudioController.createListeningAudioController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  ListeningAudioController.getAllListeningAudiosController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  ListeningAudioController.getSingleListeningAudioController,
);

router.patch(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can update
  validateRequest(ListeningAudioValidation.updateListeningAudioZodSchema),
  ListeningAudioController.updateListeningAudioController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  ListeningAudioController.deleteListeningAudioController,
);

export const ListeningAudioRoutes = router;

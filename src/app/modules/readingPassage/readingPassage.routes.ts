import express from 'express';
import { ReadingPassageController } from './readingPassage.controller';
import { ReadingPassageValidation } from './readingPassage.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.ADMIN]), // Only ADMIN can create
  validateRequest(ReadingPassageValidation.createReadingPassageZodSchema),
  ReadingPassageController.createReadingPassageController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  ReadingPassageController.getAllReadingPassagesController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  ReadingPassageController.getSingleReadingPassageController,
);

router.patch(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can update
  validateRequest(ReadingPassageValidation.updateReadingPassageZodSchema),
  ReadingPassageController.updateReadingPassageController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  ReadingPassageController.deleteReadingPassageController,
);

export const ReadingPassageRoutes = router;

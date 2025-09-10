import express from 'express';
import { AnswerController } from './answer.controller';
import { AnswerValidation } from './answer.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can create answers
  validateRequest(AnswerValidation.createAnswerZodSchema),
  AnswerController.createAnswerController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  AnswerController.getAllAnswersController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  AnswerController.getSingleAnswerController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can update
  validateRequest(AnswerValidation.updateAnswerZodSchema),
  AnswerController.updateAnswerController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  AnswerController.deleteAnswerController,
);

export const AnswerRoutes = router;

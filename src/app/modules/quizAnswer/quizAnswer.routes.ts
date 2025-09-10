import express from 'express';
import { QuizAnswerController } from './quizAnswer.controller';
import { QuizAnswerValidation } from './quizAnswer.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can create
  validateRequest(QuizAnswerValidation.createQuizAnswerZodSchema),
  QuizAnswerController.createQuizAnswerController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  QuizAnswerController.getAllQuizAnswersController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  QuizAnswerController.getSingleQuizAnswerController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can update
  validateRequest(QuizAnswerValidation.updateQuizAnswerZodSchema),
  QuizAnswerController.updateQuizAnswerController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  QuizAnswerController.deleteQuizAnswerController,
);

export const QuizAnswerRoutes = router;

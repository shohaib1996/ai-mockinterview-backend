import express from 'express';
import { QuizAttemptController } from './quizAttempt.controller';
import { QuizAttemptValidation } from './quizAttempt.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can create
  validateRequest(QuizAttemptValidation.createQuizAttemptZodSchema),
  QuizAttemptController.createQuizAttemptController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  QuizAttemptController.getAllQuizAttemptsController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  QuizAttemptController.getSingleQuizAttemptController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can update
  validateRequest(QuizAttemptValidation.updateQuizAttemptZodSchema),
  QuizAttemptController.updateQuizAttemptController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  QuizAttemptController.deleteQuizAttemptController,
);

export const QuizAttemptRoutes = router;

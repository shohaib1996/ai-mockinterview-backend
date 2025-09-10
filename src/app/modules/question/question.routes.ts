import express from 'express';
import { QuestionController } from './question.controller';
import { QuestionValidation } from './question.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.ADMIN]), // Only ADMIN can create
  validateRequest(QuestionValidation.createQuestionZodSchema),
  QuestionController.createQuestionController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  QuestionController.getAllQuestionsController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  QuestionController.getSingleQuestionController,
);

router.patch(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can update
  validateRequest(QuestionValidation.updateQuestionZodSchema),
  QuestionController.updateQuestionController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  QuestionController.deleteQuestionController,
);

router.post(
  '/generate',
  auth([Role.ADMIN, Role.USER]), // Only ADMIN can generate questions
  validateRequest(QuestionValidation.generateQuestionsZodSchema),
  QuestionController.generateQuestionsController,
);

export const QuestionRoutes = router;

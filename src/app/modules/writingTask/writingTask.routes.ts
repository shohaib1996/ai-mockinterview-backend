import express from 'express';
import { WritingTaskController } from './writingTask.controller';
import { WritingTaskValidation } from './writingTask.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/create',
  auth([Role.ADMIN]),
  validateRequest(WritingTaskValidation.createWritingTaskZodSchema),
  WritingTaskController.createWritingTaskController,
);

router.get('/', auth([Role.USER, Role.ADMIN]), WritingTaskController.getAllWritingTasksController);

router.get('/:id', auth([Role.USER, Role.ADMIN]), WritingTaskController.getSingleWritingTaskController);

router.patch(
  '/:id',
  auth([Role.ADMIN]),
  validateRequest(WritingTaskValidation.updateWritingTaskZodSchema),
  WritingTaskController.updateWritingTaskController,
);

router.delete('/:id', auth([Role.ADMIN]), WritingTaskController.deleteWritingTaskController);

export const WritingTaskRoutes = router;

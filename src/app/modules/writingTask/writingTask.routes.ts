import express from 'express';
import { WritingTaskController } from './writingTask.controller';
import { WritingTaskValidation } from './writingTask.validation';
import validateRequest from '@/app/middlewares/validateRequest';

const router = express.Router();

router.post(
  '/create',
  validateRequest(WritingTaskValidation.createWritingTaskZodSchema),
  WritingTaskController.createWritingTaskController,
);

router.get('/', WritingTaskController.getAllWritingTasksController);

router.get('/:id', WritingTaskController.getSingleWritingTaskController);

router.patch(
  '/:id',
  validateRequest(WritingTaskValidation.updateWritingTaskZodSchema),
  WritingTaskController.updateWritingTaskController,
);

router.delete('/:id', WritingTaskController.deleteWritingTaskController);

export const WritingTaskRoutes = router;

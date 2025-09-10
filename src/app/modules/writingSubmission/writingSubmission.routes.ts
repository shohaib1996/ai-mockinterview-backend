import express from 'express';
import { WritingSubmissionController } from './writingSubmission.controller';
import { WritingSubmissionValidation } from './writingSubmission.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can create
  validateRequest(WritingSubmissionValidation.createWritingSubmissionZodSchema),
  WritingSubmissionController.createWritingSubmissionController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  WritingSubmissionController.getAllWritingSubmissionsController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  WritingSubmissionController.getSingleWritingSubmissionController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can update
  validateRequest(WritingSubmissionValidation.updateWritingSubmissionZodSchema),
  WritingSubmissionController.updateWritingSubmissionController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  WritingSubmissionController.deleteWritingSubmissionController,
);

export const WritingSubmissionRoutes = router;

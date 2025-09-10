import express from 'express';
import { UserProgressController } from './userProgress.controller';
import { UserProgressValidation } from './userProgress.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can create
  validateRequest(UserProgressValidation.createUserProgressZodSchema),
  UserProgressController.createUserProgressController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get all
  UserProgressController.getAllUserProgressController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can get single
  UserProgressController.getSingleUserProgressController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // USER and ADMIN can update
  validateRequest(UserProgressValidation.updateUserProgressZodSchema),
  UserProgressController.updateUserProgressController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete
  UserProgressController.deleteUserProgressController,
);

export const UserProgressRoutes = router;

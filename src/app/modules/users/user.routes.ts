import express from 'express';

import { UserController } from './user.controller';
import validateRequest from '@/app/middlewares/validateRequest';
import {
  createUserZodSchema,
  getAllUsersZodSchema,
  loginUserZodSchema,
  changeUserRoleZodSchema,
} from './user.validation';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post('/register', validateRequest(createUserZodSchema), UserController.createUserController);
router.post('/login', validateRequest(loginUserZodSchema), UserController.loginUserController);

router.get(
  '/',
  validateRequest(getAllUsersZodSchema),
  auth([Role.ADMIN]),
  UserController.getAllUsersController,
);

router.patch(
  '/:id/role',
  validateRequest(changeUserRoleZodSchema),
  auth([Role.ADMIN]),
  UserController.changeUserRoleController,
);

export const UserRoutes = router;

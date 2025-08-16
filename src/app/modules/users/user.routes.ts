import express from 'express';



import { UserController } from './user.controller';
import validateRequest from '@/app/middlewares/validateRequest';
import { createUserZodSchema, getAllUsersZodSchema, loginUserZodSchema } from './user.validation';

const router = express.Router();

router.post('/register', validateRequest(createUserZodSchema), UserController.createUserController);
router.post(
  '/login',
  validateRequest(loginUserZodSchema),
  UserController.loginUserController,
);

router.get(
  '/',
  validateRequest(getAllUsersZodSchema),
  UserController.getAllUsersController,
);

export const UserRoutes = router;

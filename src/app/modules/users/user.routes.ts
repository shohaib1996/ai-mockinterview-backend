import express from 'express';



import { createUserSchema, loginUserSchema } from './user.validation';
import { UserController } from './user.controller';
import validateRequest from '@/app/middlewares/validateRequest';

const router = express.Router();

router.post('/register', validateRequest(createUserSchema), UserController.createUserController);
router.post('/login', validateRequest(loginUserSchema), UserController.loginUserController);

export const UserRoutes = router;

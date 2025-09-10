import express from 'express';
import { SessionController } from './session.controller';
import { SessionValidation } from './session.validation'; // Import auth middleware
import { Role } from '@prisma/client'; // Import Role enum
import auth from '@/app/middlewares/auth';
import validateRequest from '@/app/middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  auth([Role.USER, Role.ADMIN]), // Apply auth middleware
  validateRequest(SessionValidation.createSessionZodSchema),
  SessionController.createSessionController,
);

router.get(
  '/',
  auth([Role.USER, Role.ADMIN]), // Apply auth middleware
  SessionController.getAllSessionsController,
);

router.get(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // Apply auth middleware
  SessionController.getSingleSessionController,
);

router.patch(
  '/:id',
  auth([Role.USER, Role.ADMIN]), // Apply auth middleware
  validateRequest(SessionValidation.updateSessionZodSchema),
  SessionController.updateSessionController,
);

router.delete(
  '/:id',
  auth([Role.ADMIN]), // Only ADMIN can delete sessions
  SessionController.deleteSessionController,
);

export const SessionRoutes = router;

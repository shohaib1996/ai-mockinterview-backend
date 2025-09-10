import express from 'express';
import { AiChatController } from './ai-chat.controller';
import { AiChatValidation } from './ai-chat.validation';
import validateRequest from '@/app/middlewares/validateRequest';
import auth from '@/app/middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/ielts-speaking-mock',
  auth([Role.USER, Role.ADMIN]),
  validateRequest(AiChatValidation.createChatCompletionZodSchema),
  AiChatController.createChatCompletionController,
);

router.get(
  '/:sessionId',
  auth([Role.USER, Role.ADMIN]),
  validateRequest(AiChatValidation.getConversationBySessionIdZodSchema),
  AiChatController.getConversationBySessionId,
);

router.post(
  '/analyze/:sessionId',
  auth([Role.USER, Role.ADMIN]),
  AiChatController.analyzeConversationController,
);

export const AiChatRoutes = router;

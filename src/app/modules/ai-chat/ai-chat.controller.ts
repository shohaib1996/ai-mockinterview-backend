import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { AiChatServices } from './ai-chat.services';

const createChatCompletionController = catchAsync(async (req: Request, res: Response) => {
  const result = await AiChatServices.createChatCompletion(req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'AI chat completion successful',
    data: result,
  });
});

const getConversationBySessionId = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await AiChatServices.getConversationBySessionId(sessionId!);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Conversation retrieved successfully',
    data: result,
  });
});

const analyzeConversationController = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = await AiChatServices.analyzeConversation(sessionId!);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Conversation analyzed successfully',
    data: result,
  });
});

export const AiChatController = {
  createChatCompletionController,
  getConversationBySessionId,
  analyzeConversationController,
};

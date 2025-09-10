import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { MockInterviewServices } from './mock-interview.services';

const uploadQuestionsController = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Session ID is required',
    });
  }
  const result = await MockInterviewServices.uploadQuestions(
    sessionId as string,
    req.file as Express.Multer.File,
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Questions uploaded successfully',
    data: result,
  });
});

const chatController = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Session ID is required',
    });
  }
  const { conversation } = req.body;
  const result = await MockInterviewServices.chat(sessionId, conversation);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'AI response retrieved successfully',
    data: result,
  });
});

const getConversationHistoryController = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Session ID is required',
    });
  }
  const result = await MockInterviewServices.getConversationHistory(sessionId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Conversation history retrieved successfully',
    data: result,
  });
});

const analyzeConversationController = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Session ID is required',
    });
  }
  const result = await MockInterviewServices.analyzeConversation(sessionId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Conversation analyzed successfully',
    data: result,
  });
});

export const MockInterviewController = {
  uploadQuestionsController,
  chatController,
  getConversationHistoryController,
  analyzeConversationController,
};

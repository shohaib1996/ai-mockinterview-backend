import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '@/app/utils/catchAsync';
import { SpeakingTestServices } from './speakingTest.services';
import { ApiError } from '@/app/errors/apiError';
import { User } from '@prisma/client';

const startSpeakingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const result = await SpeakingTestServices.assignSpeakingTest(userId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Speaking test started',
    data: result,
  });
});

const getSpeakingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await SpeakingTestServices.getSpeakingTestBySession(sessionId, userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking test retrieved',
    data: result,
  });
});

const chat = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const { part, conversation } = req.body;
  const result = await SpeakingTestServices.chat(sessionId, userId, { part, conversation });
  res.status(httpStatus.OK).json({
    success: true,
    message: 'AI response retrieved',
    data: result,
  });
});

const transcribe = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Audio file is required');
  }
  // Confirms the session belongs to this user before spending money transcribing it.
  await SpeakingTestServices.getSpeakingTestBySession(sessionId, userId);
  const result = await SpeakingTestServices.transcribeAudio(req.file.buffer, req.file.mimetype);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Audio transcribed',
    data: result,
  });
});

const submitPart2 = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const { transcript } = req.body;
  const result = await SpeakingTestServices.submitPart2(sessionId, userId, { transcript });
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Part 2 response recorded',
    data: result,
  });
});

const analyzeSpeakingTest = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as User;
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session ID is required');
  }
  const result = await SpeakingTestServices.analyzeSpeakingTest(sessionId, userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Speaking test analyzed',
    data: result,
  });
});

export const SpeakingTestController = {
  startSpeakingTest,
  getSpeakingTest,
  chat,
  transcribe,
  submitPart2,
  analyzeSpeakingTest,
};

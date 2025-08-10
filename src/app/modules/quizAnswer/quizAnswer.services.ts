import { Prisma, QuizAnswer } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateQuizAnswerPayload, IUpdateQuizAnswerPayload } from './quizAnswer.interface';

const createQuizAnswer = async (payload: ICreateQuizAnswerPayload): Promise<QuizAnswer> => {
  try {
    const result = await prisma.quizAnswer.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create quiz answer');
  }
};

const getAllQuizAnswers = async (): Promise<QuizAnswer[]> => {
  try {
    const result = await prisma.quizAnswer.findMany();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve quiz answers');
  }
};

const getSingleQuizAnswer = async (id: string): Promise<QuizAnswer | null> => {
  try {
    const result = await prisma.quizAnswer.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve quiz answer');
  }
};

const updateQuizAnswer = async (id: string, payload: IUpdateQuizAnswerPayload): Promise<QuizAnswer> => {
  try {
    const result = await prisma.quizAnswer.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Quiz answer not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update quiz answer');
  }
};

const deleteQuizAnswer = async (id: string): Promise<QuizAnswer> => {
  try {
    const result = await prisma.quizAnswer.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Quiz answer not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete quiz answer');
  }
};

export const QuizAnswerServices = {
  createQuizAnswer,
  getAllQuizAnswers,
  getSingleQuizAnswer,
  updateQuizAnswer,
  deleteQuizAnswer,
};
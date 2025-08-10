import { Prisma, Question } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateQuestionPayload, IUpdateQuestionPayload } from './question.interface';

const createQuestion = async (payload: ICreateQuestionPayload): Promise<Question> => {
  try {
    const result = await prisma.question.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create question');
  }
};

const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const result = await prisma.question.findMany();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve questions');
  }
};

const getSingleQuestion = async (id: string): Promise<Question | null> => {
  try {
    const result = await prisma.question.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve question');
  }
};

const updateQuestion = async (id: string, payload: IUpdateQuestionPayload): Promise<Question> => {
  try {
    const result = await prisma.question.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update question');
  }
};

const deleteQuestion = async (id: string): Promise<Question> => {
  try {
    const result = await prisma.question.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete question');
  }
};

export const QuestionServices = {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
};
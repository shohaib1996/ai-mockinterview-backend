import { Prisma, Answer } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateAnswerPayload, IUpdateAnswerPayload } from './answer.interface';

const createAnswer = async (payload: ICreateAnswerPayload): Promise<Answer> => {
  try {
    const result = await prisma.answer.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create answer');
  }
};

const getAllAnswers = async (): Promise<Answer[]> => {
  try {
    const result = await prisma.answer.findMany();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve answers');
  }
};

const getSingleAnswer = async (id: string): Promise<Answer | null> => {
  try {
    const result = await prisma.answer.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve answer');
  }
};

const updateAnswer = async (id: string, payload: IUpdateAnswerPayload): Promise<Answer> => {
  try {
    const result = await prisma.answer.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Answer not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update answer');
  }
};

const deleteAnswer = async (id: string): Promise<Answer> => {
  try {
    const result = await prisma.answer.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Answer not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete answer');
  }
};

export const AnswerServices = {
  createAnswer,
  getAllAnswers,
  getSingleAnswer,
  updateAnswer,
  deleteAnswer,
};
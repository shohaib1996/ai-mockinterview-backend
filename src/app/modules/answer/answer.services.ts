import { Prisma, Answer } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateAnswerPayload, IUpdateAnswerPayload } from './answer.interface';

const createAnswer = async (
  payload: ICreateAnswerPayload | ICreateAnswerPayload[],
): Promise<Answer | Answer[]> => {
  try {
    if (Array.isArray(payload)) {
      const result = await prisma.$transaction(
        payload.map((p) => prisma.answer.create({ data: p })),
      );
      return result;
    }
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

const getAllAnswers = async (options: {
  page?: number;
  limit?: number;
  sessionId?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: Answer[] }> => {
  const { page = 1, limit = 10, sessionId } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.AnswerWhereInput = {};
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const result = await prisma.answer.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await prisma.answer.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
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
      if (error.code === 'P2025') {
        // Record to update not found
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
      if (error.code === 'P2025') {
        // Record to delete not found
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

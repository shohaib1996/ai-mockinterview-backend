import { Prisma, QuizAttempt } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateQuizAttemptPayload, IUpdateQuizAttemptPayload } from './quizAttempt.interface';

const createQuizAttempt = async (payload: ICreateQuizAttemptPayload): Promise<QuizAttempt> => {
  try {
    const result = await prisma.quizAttempt.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create quiz attempt');
  }
};

const getAllQuizAttempts = async (options: {
  page?: number;
  limit?: number;
  userId?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: QuizAttempt[] }> => {
  const { page = 1, limit = 10, userId } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.QuizAttemptWhereInput = {};
    if (userId) {
      where.userId = userId;
    }

    const result = await prisma.quizAttempt.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.quizAttempt.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve quiz attempts');
  }
};

const getSingleQuizAttempt = async (id: string): Promise<QuizAttempt | null> => {
  try {
    const result = await prisma.quizAttempt.findUnique({
      where: {
        id,
      },
      include: {
        quizAnswers: {
          include: {
            question: true, // Include the related Question for each QuizAnswer
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve quiz attempt');
  }
};

const updateQuizAttempt = async (
  id: string,
  payload: IUpdateQuizAttemptPayload,
): Promise<QuizAttempt> => {
  try {
    const result = await prisma.quizAttempt.update({
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Quiz attempt not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update quiz attempt');
  }
};

const deleteQuizAttempt = async (id: string): Promise<QuizAttempt> => {
  try {
    const result = await prisma.quizAttempt.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Quiz attempt not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete quiz attempt');
  }
};

export const QuizAttemptServices = {
  createQuizAttempt,
  getAllQuizAttempts,
  getSingleQuizAttempt,
  updateQuizAttempt,
  deleteQuizAttempt,
};

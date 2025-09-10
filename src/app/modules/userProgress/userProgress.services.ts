import { Prisma, UserProgress } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateUserProgressPayload, IUpdateUserProgressPayload } from './userProgress.interface';

const createUserProgress = async (payload: ICreateUserProgressPayload): Promise<UserProgress> => {
  try {
    const result = await prisma.userProgress.create({
      data: {
        ...payload,
        date: new Date(payload.date), // Convert string date to Date object
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        throw new ApiError(httpStatus.CONFLICT, 'User progress for this date already exists');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create user progress');
  }
};

const getAllUserProgress = async (options: {
  page?: number;
  limit?: number;
  userId?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: UserProgress[] }> => {
  const { page = 1, limit = 10, userId } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.UserProgressWhereInput = {};
    if (userId) {
      where.userId = userId;
    }

    const result = await prisma.userProgress.findMany({
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

    const total = await prisma.userProgress.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve user progress records',
    );
  }
};

const getSingleUserProgress = async (id: string): Promise<UserProgress | null> => {
  try {
    const result = await prisma.userProgress.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve user progress');
  }
};

const updateUserProgress = async (
  id: string,
  payload: IUpdateUserProgressPayload,
): Promise<UserProgress> => {
  try {
    const updateData: Prisma.UserProgressUpdateInput = {};
    if (payload.userId !== undefined) {
      updateData.user = {
        connect: {
          id: payload.userId,
        },
      };
    }
    if (payload.date !== undefined) {
      updateData.date = new Date(payload.date); // Convert string date to Date object
    }
    if (payload.ieltsScore !== undefined) {
      updateData.ieltsScore = payload.ieltsScore;
    }
    if (payload.interviewScore !== undefined) {
      updateData.interviewScore = payload.interviewScore;
    }
    if (payload.quizScore !== undefined) {
      updateData.quizScore = payload.quizScore;
    }

    const result = await prisma.userProgress.update({
      where: {
        id,
      },
      data: updateData,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'User progress not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update user progress');
  }
};

const deleteUserProgress = async (id: string): Promise<UserProgress> => {
  try {
    const result = await prisma.userProgress.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'User progress not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user progress');
  }
};

export const UserProgressServices = {
  createUserProgress,
  getAllUserProgress,
  getSingleUserProgress,
  updateUserProgress,
  deleteUserProgress,
};

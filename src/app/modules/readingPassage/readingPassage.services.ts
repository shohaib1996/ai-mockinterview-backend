import { Prisma, ReadingPassage } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import {
  ICreateReadingPassagePayload,
  IUpdateReadingPassagePayload,
} from './readingPassage.interface';

const createReadingPassage = async (
  payload: ICreateReadingPassagePayload,
): Promise<ReadingPassage> => {
  try {
    const result = await prisma.readingPassage.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create reading passage');
  }
};

const getAllReadingPassages = async (options: {
  page?: number;
  limit?: number;
  userId?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: ReadingPassage[] }> => {
  const { page = 1, limit = 10, userId } = options;
  const skip = (page - 1) * limit;

  try {
    let where: Prisma.ReadingPassageWhereInput = {};

    if (userId) {
      const completedPassageIds = await prisma.userCompletionHistory.findMany({
        where: {
          userId: userId,
          readingPassageId: {
            not: null,
          },
        },
        select: {
          readingPassageId: true,
        },
      });

      const idsToExclude = completedPassageIds.map((item) => item.readingPassageId as string);

      where = {
        id: {
          notIn: idsToExclude,
        },
      };
    }

    const result = await prisma.readingPassage.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await prisma.readingPassage.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve reading passages');
  }
};

const getSingleReadingPassage = async (id: string): Promise<ReadingPassage | null> => {
  try {
    const result = await prisma.readingPassage.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve reading passage');
  }
};

const updateReadingPassage = async (
  id: string,
  payload: IUpdateReadingPassagePayload,
): Promise<ReadingPassage> => {
  try {
    const result = await prisma.readingPassage.update({
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Reading passage not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update reading passage');
  }
};

const deleteReadingPassage = async (id: string): Promise<ReadingPassage> => {
  try {
    const result = await prisma.readingPassage.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Reading passage not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete reading passage');
  }
};

export const ReadingPassageServices = {
  createReadingPassage,
  getAllReadingPassages,
  getSingleReadingPassage,
  updateReadingPassage,
  deleteReadingPassage,
};

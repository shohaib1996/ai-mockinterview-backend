import { Prisma, ListeningAudio } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import {
  ICreateListeningAudioPayload,
  IUpdateListeningAudioPayload,
} from './listeningAudio.interface';

const createListeningAudio = async (
  payload: ICreateListeningAudioPayload,
): Promise<ListeningAudio> => {
  try {
    const result = await prisma.listeningAudio.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create listening audio');
  }
};

const getAllListeningAudios = async (options: {
  page?: number;
  limit?: number;
  userId?: string; // Add userId to options
}): Promise<{ meta: { page: number; limit: number; total: number }; data: ListeningAudio[] }> => {
  const { page = 1, limit = 10, userId } = options; // Destructure userId
  const skip = (page - 1) * limit;

  try {
    let where: Prisma.ListeningAudioWhereInput = {};

    if (userId) {
      // Get IDs of audios completed by the user
      const completedAudioIds = await prisma.userCompletionHistory.findMany({
        where: {
          userId: userId,
          listeningAudioId: {
            not: null,
          },
        },
        select: {
          listeningAudioId: true,
        },
      });

      const idsToExclude = completedAudioIds
        .map((item) => item.listeningAudioId)
        .filter((id): id is string => id !== null);

      // Add a filter to exclude completed audios
      where = {
        id: {
          notIn: idsToExclude,
        },
      };
    }

    const result = await prisma.listeningAudio.findMany({
      where, // Apply the where clause
      skip,
      take: limit,
    });

    const total = await prisma.listeningAudio.count({ where }); // Count with the where clause

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve listening audios');
  }
};

const getSingleListeningAudio = async (id: string): Promise<ListeningAudio | null> => {
  try {
    const result = await prisma.listeningAudio.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve listening audio');
  }
};

const updateListeningAudio = async (
  id: string,
  payload: IUpdateListeningAudioPayload,
): Promise<ListeningAudio> => {
  try {
    const result = await prisma.listeningAudio.update({
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Listening audio not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update listening audio');
  }
};

const deleteListeningAudio = async (id: string): Promise<ListeningAudio> => {
  try {
    const result = await prisma.listeningAudio.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Listening audio not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete listening audio');
  }
};

export const ListeningAudioServices = {
  createListeningAudio,
  getAllListeningAudios,
  getSingleListeningAudio,
  updateListeningAudio,
  deleteListeningAudio,
};

import { Difficulty, IELTSWritingTaskType, Prisma, WritingTask } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';

export interface ICreateWritingTaskPayload {
  task: IELTSWritingTaskType;
  promptText: string;
  imageUrl?: string;
  difficulty?: Difficulty;
}

const createWritingTask = async (payload: ICreateWritingTaskPayload): Promise<WritingTask> => {
  try {
    const result = await prisma.writingTask.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create writing task');
  }
};

const getAllWritingTasks = async (options: {
  page?: number;
  limit?: number;
  task?: IELTSWritingTaskType;
  difficulty?: Difficulty;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: WritingTask[] }> => {
  const { page = 1, limit = 10, task, difficulty } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.WritingTaskWhereInput = {};
    if (task) {
      where.task = task;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const result = await prisma.writingTask.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await prisma.writingTask.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing tasks');
  }
};

const getSingleWritingTask = async (id: string): Promise<WritingTask | null> => {
  try {
    const result = await prisma.writingTask.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing task');
  }
};

const updateWritingTask = async (
  id: string,
  payload: Partial<ICreateWritingTaskPayload>,
): Promise<WritingTask> => {
  try {
    const result = await prisma.writingTask.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing task not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update writing task');
  }
};

const deleteWritingTask = async (id: string): Promise<WritingTask> => {
  try {
    const result = await prisma.writingTask.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing task not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete writing task');
  }
};

export const WritingTaskServices = {
  createWritingTask,
  getAllWritingTasks,
  getSingleWritingTask,
  updateWritingTask,
  deleteWritingTask,
};

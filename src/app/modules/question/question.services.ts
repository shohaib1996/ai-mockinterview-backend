import { Prisma, Question, SessionType } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateQuestionPayload, IUpdateQuestionPayload, IQuestionFilters } from './question.interface';

const createQuestion = async (payload: ICreateQuestionPayload | ICreateQuestionPayload[]): Promise<Question | { count: number }> => {
  try {
    if (Array.isArray(payload)) {
      const result = await prisma.question.createMany({
        data: payload,
      });
      return result;
    }
    const result = await prisma.question.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create question(s)');
  }
};

const getAllQuestions = async (
  filters: IQuestionFilters
): Promise<{ meta: { page: number; limit: number; total: number }; data: Question[] }> => {
  const { sessionType, listeningAudioId, readingPassageId, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {};

  if (sessionType) {
    where.sessionType = sessionType;
  }

  if (listeningAudioId) {
    where.listeningAudioId = listeningAudioId;
  }

  if (readingPassageId) {
    where.readingPassageId = readingPassageId;
  }

  try {
    const result = await prisma.question.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await prisma.question.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
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
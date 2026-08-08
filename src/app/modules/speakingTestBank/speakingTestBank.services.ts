import { Difficulty, Prisma, SpeakingTest } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateSpeakingTestPayload } from './speakingTestBank.interface';

const createSpeakingTest = async (
  payload: ICreateSpeakingTestPayload,
): Promise<SpeakingTest> => {
  try {
    return await prisma.speakingTest.create({ data: payload });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create speaking test');
  }
};

const getAllSpeakingTests = async (options: {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: SpeakingTest[] }> => {
  const { page = 1, limit = 10, difficulty } = options;
  const skip = (page - 1) * limit;
  const where: Prisma.SpeakingTestWhereInput = difficulty ? { difficulty } : {};

  try {
    const [result, total] = await Promise.all([
      prisma.speakingTest.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.speakingTest.count({ where }),
    ]);

    return { meta: { page, limit, total }, data: result };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve speaking tests');
  }
};

const getSingleSpeakingTest = async (id: string): Promise<SpeakingTest | null> => {
  try {
    return await prisma.speakingTest.findUnique({ where: { id } });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve speaking test');
  }
};

const updateSpeakingTest = async (
  id: string,
  payload: Partial<ICreateSpeakingTestPayload>,
): Promise<SpeakingTest> => {
  try {
    return await prisma.speakingTest.update({ where: { id }, data: payload });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Speaking test not found');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update speaking test');
  }
};

const deleteSpeakingTest = async (id: string): Promise<SpeakingTest> => {
  const sessionCount = await prisma.session.count({ where: { speakingTestId: id } });
  if (sessionCount > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot delete: ${sessionCount} session(s) have already used this test`,
    );
  }

  try {
    return await prisma.speakingTest.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Speaking test not found');
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete speaking test');
  }
};

export const SpeakingTestBankServices = {
  createSpeakingTest,
  getAllSpeakingTests,
  getSingleSpeakingTest,
  updateSpeakingTest,
  deleteSpeakingTest,
};

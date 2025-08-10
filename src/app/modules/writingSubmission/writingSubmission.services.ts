import { Prisma, WritingSubmission } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import { ICreateWritingSubmissionPayload, IUpdateWritingSubmissionPayload } from './writingSubmission.interface';

const createWritingSubmission = async (payload: ICreateWritingSubmissionPayload): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create writing submission');
  }
};

const getAllWritingSubmissions = async (): Promise<WritingSubmission[]> => {
  try {
    const result = await prisma.writingSubmission.findMany();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing submissions');
  }
};

const getSingleWritingSubmission = async (id: string): Promise<WritingSubmission | null> => {
  try {
    const result = await prisma.writingSubmission.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing submission');
  }
};

const updateWritingSubmission = async (id: string, payload: IUpdateWritingSubmissionPayload): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing submission not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update writing submission');
  }
};

const deleteWritingSubmission = async (id: string): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing submission not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete writing submission');
  }
};

export const WritingSubmissionServices = {
  createWritingSubmission,
  getAllWritingSubmissions,
  getSingleWritingSubmission,
  updateWritingSubmission,
  deleteWritingSubmission,
};
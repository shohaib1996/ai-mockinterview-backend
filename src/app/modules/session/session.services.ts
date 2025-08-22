import { Prisma, Session, SessionType, Question, Answer, UserListeningHistory } from '@prisma/client';
import httpStatus from 'http-status';

import { ICreateSessionPayload, IUpdateSessionPayload } from './session.interface';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';

const createSession = async (
  userId: string,
  payload: ICreateSessionPayload,
): Promise<Session> => {
  try {
    const result = await prisma.session.create({
      data: {
        ...payload,
        userId,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create session');
  }
};

const getAllSessions = async (options: {
  page?: number;
  limit?: number;
  userId?: string;
  type?: string;
}): Promise<{ meta: { page: number; limit: number; total: number }; data: Session[] }> => {
  const { page = 1, limit = 10, userId, type } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.SessionWhereInput = {};
    if (userId) {
      where.userId = userId;
    }
    if (type) {
      where.type = type as SessionType;
    }

    const result = await prisma.session.findMany({
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

    const total = await prisma.session.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve sessions');
  }
};

const getSingleSession = async (id: string): Promise<Session | null> => {
  try {
    const result = await prisma.session.findUnique({
      where: {
        id,
      },
      include: {
        aiChatConversations: true,
        writingSubmissions: true,
        userListeningHistory: true,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve session');
  }
};

const updateSession = async (id: string, payload: IUpdateSessionPayload): Promise<Session> => {
  try {
    // Fetch the existing session to check its type and userId before update
    const existingSession = await prisma.session.findUnique({
      where: { id },
      select: {
        userId: true,
        type: true,
      },
    });

    if (!existingSession) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
    }

    const result = await prisma.session.update({
      where: {
        id,
      },
      data: payload,
    });

    // If the session is an IELTS_LISTENING session and endedAt is being set
    if (
      existingSession.type === SessionType.IELTS_LISTENING &&
      payload.endedAt !== undefined &&
      payload.endedAt !== null
    ) {
      // Find all questions associated with this session's answers that have a listeningAudioId
      const questionsWithListeningAudio = await prisma.question.findMany({
        where: {
          answers: {
            some: {
              sessionId: id,
            },
          },
          listeningAudioId: {
            not: null,
          },
        },
        select: {
          listeningAudioId: true,
        },
      });

      const uniqueListeningAudioIds = [
        ...new Set(
          questionsWithListeningAudio
            .map((q) => q.listeningAudioId)
            .filter((id): id is string => id !== null),
        ),
      ];

      // Create UserListeningHistory records for each unique listening audio
      for (const audioId of uniqueListeningAudioIds) {
        await prisma.userListeningHistory.upsert({
          where: {
            userId_listeningAudioId: {
              userId: existingSession.userId,
              listeningAudioId: audioId,
            },
          },
          update: {
            completedAt: new Date(),
            sessionId: result.id, // Update with the current session ID
          },
          create: {
            userId: existingSession.userId,
            listeningAudioId: audioId,
            sessionId: result.id,
          },
        });
      }
    }

    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update session');
  }
};

const deleteSession = async (id: string): Promise<Session> => {
  try {
    const result = await prisma.session.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete session');
  }
};

export const SessionServices = {
  createSession,
  getAllSessions,
  getSingleSession,
  updateSession,
  deleteSession,
};
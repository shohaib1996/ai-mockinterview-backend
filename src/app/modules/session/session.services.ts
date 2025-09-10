import { Prisma, Session, SessionType } from '@prisma/client';
import httpStatus from 'http-status';

import { ICreateSessionPayload, IUpdateSessionPayload } from './session.interface';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';

const createSession = async (userId: string, payload: ICreateSessionPayload): Promise<Session> => {
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
        userCompletionHistory: true,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve session');
  }
};

const updateSession = async (id: string, payload: IUpdateSessionPayload): Promise<Session> => {
  try {
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

    if (payload.endedAt !== undefined && payload.endedAt !== null) {
      if (existingSession.type === SessionType.IELTS_LISTENING) {
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

        for (const audioId of uniqueListeningAudioIds) {
          await prisma.userCompletionHistory.upsert({
            where: {
              userId_listeningAudioId: {
                userId: existingSession.userId,
                listeningAudioId: audioId,
              },
            },
            update: {
              completedAt: new Date(),
              sessionId: result.id,
            },
            create: {
              userId: existingSession.userId,
              listeningAudioId: audioId,
              sessionId: result.id,
            },
          });
        }
      } else if (existingSession.type === SessionType.IELTS_READING) {
        const questionsWithReadingPassage = await prisma.question.findMany({
          where: {
            answers: {
              some: {
                sessionId: id,
              },
            },
            readingPassageId: {
              not: null,
            },
          },
          select: {
            readingPassageId: true,
          },
        });

        const uniqueReadingPassageIds = [
          ...new Set(
            questionsWithReadingPassage
              .map((q) => q.readingPassageId)
              .filter((id): id is string => id !== null),
          ),
        ];

        for (const passageId of uniqueReadingPassageIds) {
          await prisma.userCompletionHistory.upsert({
            where: {
              userId_readingPassageId: {
                userId: existingSession.userId,
                readingPassageId: passageId,
              },
            },
            update: {
              completedAt: new Date(),
              sessionId: result.id,
            },
            create: {
              userId: existingSession.userId,
              readingPassageId: passageId,
              sessionId: result.id,
            },
          });
        }
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
      if (error.code === 'P2025') {
        // Record to delete not found
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

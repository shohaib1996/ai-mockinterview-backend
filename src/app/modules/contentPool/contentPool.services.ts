import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { Difficulty, SessionType } from '@prisma/client';
import { WritingTaskServices } from '@/app/modules/writingTask/writingTask.services';
import { SpeakingTestBankServices } from '@/app/modules/speakingTestBank/speakingTestBank.services';

const PAGE_SIZE_DEFAULT = 10;

interface IListOptions {
  page?: number | undefined;
  limit?: number | undefined;
  difficulty?: Difficulty | undefined;
}

const listTests = async (skill: SessionType, options: IListOptions) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? PAGE_SIZE_DEFAULT;
  const skip = (page - 1) * limit;
  const difficultyFilter = options.difficulty ? { difficulty: options.difficulty } : {};

  if (skill === SessionType.IELTS_READING) {
    const [rows, total] = await Promise.all([
      prisma.readingTest.findMany({
        where: difficultyFilter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingTest.count({ where: difficultyFilter }),
    ]);
    return {
      meta: { page, limit, total },
      data: rows.map((t) => ({
        id: t.id,
        title: t.title,
        difficulty: t.difficulty,
        createdAt: t.createdAt,
      })),
    };
  }

  if (skill === SessionType.IELTS_LISTENING) {
    const [rows, total] = await Promise.all([
      prisma.listeningTest.findMany({
        where: difficultyFilter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listeningTest.count({ where: difficultyFilter }),
    ]);
    return {
      meta: { page, limit, total },
      data: rows.map((t) => ({
        id: t.id,
        title: t.title,
        difficulty: t.difficulty,
        createdAt: t.createdAt,
      })),
    };
  }

  if (skill === SessionType.IELTS_WRITING) {
    const [rows, total] = await Promise.all([
      prisma.writingTask.findMany({
        where: difficultyFilter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.writingTask.count({ where: difficultyFilter }),
    ]);
    return {
      meta: { page, limit, total },
      data: rows.map((t) => ({
        id: t.id,
        title: `${t.task}: ${t.promptText.slice(0, 80)}${t.promptText.length > 80 ? '...' : ''}`,
        difficulty: t.difficulty,
        createdAt: t.createdAt,
      })),
    };
  }

  if (skill === SessionType.IELTS_SPEAKING) {
    const [rows, total] = await Promise.all([
      prisma.speakingTest.findMany({
        where: difficultyFilter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.speakingTest.count({ where: difficultyFilter }),
    ]);
    return {
      meta: { page, limit, total },
      data: rows.map((t) => ({
        id: t.id,
        title: `${t.part1Topic} / ${t.cueCardTopic}`,
        difficulty: t.difficulty,
        createdAt: t.createdAt,
      })),
    };
  }

  throw new ApiError(httpStatus.BAD_REQUEST, `Listing for ${skill} is not available`);
};

const deleteTest = async (skill: SessionType, id: string) => {
  if (skill === SessionType.IELTS_READING) {
    const sessionCount = await prisma.session.count({ where: { readingTestId: id } });
    if (sessionCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete: ${sessionCount} session(s) have already used this test`,
      );
    }
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { readingPassage: { readingTestId: id } } }),
      prisma.readingPassage.deleteMany({ where: { readingTestId: id } }),
      prisma.readingTest.delete({ where: { id } }),
    ]);
    return;
  }

  if (skill === SessionType.IELTS_LISTENING) {
    const sessionCount = await prisma.session.count({ where: { listeningTestId: id } });
    if (sessionCount > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete: ${sessionCount} session(s) have already used this test`,
      );
    }
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { listeningAudio: { listeningTestId: id } } }),
      prisma.listeningAudio.deleteMany({ where: { listeningTestId: id } }),
      prisma.listeningTest.delete({ where: { id } }),
    ]);
    return;
  }

  if (skill === SessionType.IELTS_WRITING) {
    // Delegate to the canonical guarded delete so this always matches the
    // result of deleting the same task from the writing-tasks admin page.
    await WritingTaskServices.deleteWritingTask(id);
    return;
  }

  if (skill === SessionType.IELTS_SPEAKING) {
    // Delegate to the canonical guarded delete so this always matches the
    // result of deleting the same test from the speaking-test-bank admin page.
    await SpeakingTestBankServices.deleteSpeakingTest(id);
    return;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, `Deletion for ${skill} is not available`);
};

export const ContentPoolServices = { listTests, deleteTest };

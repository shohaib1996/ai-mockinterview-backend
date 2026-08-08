import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { Difficulty, IELTSWritingTaskType, SessionType } from '@prisma/client';
import { WritingTaskGenerator } from '../writingTask/writingTask.generator';
import { WritingGraderService } from '../writingTask/writingGrader.service';
import { ISubmitWritingTest } from './writingTest.interface';

const MIN_POOL_SIZE_PER_DIFFICULTY = 3;

const assignTask = async (userId: string, task: IELTSWritingTaskType) => {
  const completedTaskIds = (
    await prisma.writingSubmission.findMany({
      where: { userId, writingTask: { task }, score: { not: null } },
      select: { writingTaskId: true },
    })
  ).map((s) => s.writingTaskId);

  const existing = await prisma.writingTask.findFirst({
    where: { task, id: { notIn: completedTaskIds } },
  });
  if (existing) return existing;

  return task === IELTSWritingTaskType.TASK1
    ? WritingTaskGenerator.generateTask1('MEDIUM')
    : WritingTaskGenerator.generateTask2('MEDIUM');
};

const assignWritingTest = async (userId: string) => {
  const [task1, task2] = await Promise.all([
    assignTask(userId, IELTSWritingTaskType.TASK1),
    assignTask(userId, IELTSWritingTaskType.TASK2),
  ]);

  const session = await prisma.session.create({
    data: { userId, type: SessionType.IELTS_WRITING },
  });

  const [submission1, submission2] = await Promise.all([
    prisma.writingSubmission.create({
      data: { userId, sessionId: session.id, writingTaskId: task1.id },
    }),
    prisma.writingSubmission.create({
      data: { userId, sessionId: session.id, writingTaskId: task2.id },
    }),
  ]);

  return {
    session,
    task1: { ...task1, submissionId: submission1.id },
    task2: { ...task2, submissionId: submission2.id },
  };
};

const getWritingSubmissionsForSession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { writingSubmissions: { include: { writingTask: true } } },
  });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }

  const task1Submission = session.writingSubmissions.find(
    (s) => s.writingTask.task === IELTSWritingTaskType.TASK1,
  );
  const task2Submission = session.writingSubmissions.find(
    (s) => s.writingTask.task === IELTSWritingTaskType.TASK2,
  );

  if (!task1Submission || !task2Submission) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no writing tasks assigned');
  }

  return { session, task1Submission, task2Submission };
};

const getWritingTestBySession = async (sessionId: string, userId: string) => {
  const { session, task1Submission, task2Submission } = await getWritingSubmissionsForSession(
    sessionId,
    userId,
  );

  const toTaskPayload = (submission: typeof task1Submission) => ({
    ...submission.writingTask,
    submissionId: submission.id,
    submittedText: submission.extractedText,
    score: submission.score,
    criteriaScores: submission.criteriaScores,
    wordCount: submission.wordCount,
    feedback: submission.feedback,
  });

  return {
    session,
    task1: toTaskPayload(task1Submission),
    task2: toTaskPayload(task2Submission),
  };
};

const submitWritingTest = async (sessionId: string, userId: string, payload: ISubmitWritingTest) => {
  const { session, task1Submission, task2Submission } = await getWritingSubmissionsForSession(
    sessionId,
    userId,
  );

  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This writing test has already been submitted');
  }

  const [task1Result, task2Result] = await Promise.all([
    WritingGraderService.gradeWritingSubmission(
      IELTSWritingTaskType.TASK1,
      task1Submission.writingTask.promptText,
      payload.task1Text,
    ),
    WritingGraderService.gradeWritingSubmission(
      IELTSWritingTaskType.TASK2,
      task2Submission.writingTask.promptText,
      payload.task2Text,
    ),
  ]);

  await Promise.all([
    prisma.writingSubmission.update({
      where: { id: task1Submission.id },
      data: {
        extractedText: payload.task1Text,
        score: task1Result.band,
        criteriaScores: task1Result.criteriaScores as any,
        wordCount: task1Result.wordCount,
        feedback: task1Result.feedback,
      },
    }),
    prisma.writingSubmission.update({
      where: { id: task2Submission.id },
      data: {
        extractedText: payload.task2Text,
        score: task2Result.band,
        criteriaScores: task2Result.criteriaScores as any,
        wordCount: task2Result.wordCount,
        feedback: task2Result.feedback,
      },
    }),
  ]);

  // Task 2 counts twice toward the overall Writing band, per real IELTS weighting.
  const overallBand = Math.round(((task1Result.band + task2Result.band * 2) / 3) * 2) / 2;

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: { score: overallBand, endedAt: new Date() },
  });

  return { task1: task1Result, task2: task2Result, overallBand, session: updatedSession };
};

const ensurePool = async (difficulty: Difficulty) => {
  let generated = 0;

  for (const task of [IELTSWritingTaskType.TASK1, IELTSWritingTaskType.TASK2]) {
    const count = await prisma.writingTask.count({ where: { task, difficulty } });
    const toGenerate = Math.max(0, MIN_POOL_SIZE_PER_DIFFICULTY - count);

    for (let i = 0; i < toGenerate; i++) {
      try {
        if (task === IELTSWritingTaskType.TASK1) {
          await WritingTaskGenerator.generateTask1(difficulty);
        } else {
          await WritingTaskGenerator.generateTask2(difficulty);
        }
        await prisma.generationLog.create({
          data: { skill: SessionType.IELTS_WRITING, difficulty, status: 'SUCCESS' },
        });
        generated++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await prisma.generationLog.create({
          data: {
            skill: SessionType.IELTS_WRITING,
            difficulty,
            status: 'FAILED',
            errorMessage: message.slice(0, 500),
          },
        });
      }
    }
  }

  return { generated };
};

export const WritingTestServices = {
  assignWritingTest,
  getWritingTestBySession,
  submitWritingTest,
  ensurePool,
};

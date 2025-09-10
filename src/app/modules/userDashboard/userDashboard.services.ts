import {
  Prisma,
  PrismaClient,
  SessionType,
  Difficulty,
  IELTSWritingTaskType,
} from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

const getUserDashboardData = async (userId: string) => {
  // console.log('Fetching dashboard data for userId:', userId);

  // 1. Stats
  const sessions = await prisma.session.findMany({ where: { userId } });
  // console.log('Raw sessions:', sessions);

  const writingSubmissions = await prisma.writingSubmission.findMany({ where: { userId } });
  // console.log('Raw writingSubmissions:', writingSubmissions);

  const quizAttempts = await prisma.quizAttempt.findMany({ where: { userId } });
  // console.log('Raw quizAttempts:', quizAttempts);

  const quizAnswers = await prisma.quizAnswer.findMany({ where: { quizAttempt: { userId } } });
  // console.log('Raw quizAnswers:', quizAnswers);

  // Calculate average scores with cached filtered arrays
  const listeningSessions = sessions.filter(
    (s) => s.type === SessionType.IELTS_LISTENING && s.score !== null,
  );
  // console.log('Filtered listeningSessions:', listeningSessions);
  const avgListeningScore =
    listeningSessions.length > 0
      ? listeningSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / listeningSessions.length
      : 0;
  // console.log('avgListeningScore:', avgListeningScore);

  const readingSessions = sessions.filter(
    (s) => s.type === SessionType.IELTS_READING && s.score !== null,
  );
  // console.log('Filtered readingSessions:', readingSessions);
  const avgReadingScore =
    readingSessions.length > 0
      ? readingSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / readingSessions.length
      : 0;
  // console.log('avgReadingScore:', avgReadingScore);

  const speakingSessions = sessions.filter(
    (s) => s.type === SessionType.IELTS_SPEAKING && s.score !== null,
  );
  // console.log('Filtered speakingSessions:', speakingSessions);
  const avgSpeakingScore =
    speakingSessions.length > 0
      ? speakingSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / speakingSessions.length
      : 0;
  // console.log('avgSpeakingScore:', avgSpeakingScore);

  const writingSubmissionsWithScore = writingSubmissions.filter((s) => s.score !== null);
  // console.log('Filtered writingSubmissionsWithScore:', writingSubmissionsWithScore);
  const avgWritingScore =
    writingSubmissionsWithScore.length > 0
      ? writingSubmissionsWithScore.reduce((acc, s) => acc + (s.score ?? 0), 0) /
        writingSubmissionsWithScore.length
      : 0;
  // console.log('avgWritingScore:', avgWritingScore);

  const mockSessions = sessions.filter((s) => s.type.startsWith('MOCK') && s.score !== null);
  // console.log('Filtered mockSessions:', mockSessions);
  const avgMockInterviewScore =
    mockSessions.length > 0
      ? mockSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / mockSessions.length
      : 0;
  // console.log('avgMockInterviewScore:', avgMockInterviewScore);

  const latestUserProgress = await prisma.userProgress.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const totalSessionsCompleted = sessions.filter((s) => s.endedAt !== null).length;
  const totalQuizzesTaken = quizAttempts.length;
  const correctQuizAnswers = quizAnswers.filter((a) => a.isCorrect).length;
  const quizAccuracy = quizAnswers.length > 0 ? (correctQuizAnswers / quizAnswers.length) * 100 : 0;

  const skillScores: Record<string, number> = {
    [SessionType.IELTS_LISTENING]: avgListeningScore,
    [SessionType.IELTS_READING]: avgReadingScore,
    [SessionType.IELTS_SPEAKING]: avgSpeakingScore,
  };

  // Determine strongest and weakest skills
  let strongestSkill = 'N/A';
  let weakestSkill = 'N/A';
  const skillScoreEntries = Object.entries(skillScores);

  if (skillScoreEntries.length > 0) {
    let maxScore = -1;
    let minScore = Infinity;

    for (const [skill, score] of skillScoreEntries) {
      if (score > maxScore) {
        maxScore = score;
        strongestSkill = skill;
      }
      if (score < minScore) {
        minScore = score;
        weakestSkill = skill;
      }
    }
  }

  const totalTimePracticed = sessions.reduce((acc, s) => {
    if (s.startedAt && s.endedAt) {
      return acc + moment(s.endedAt).diff(moment(s.startedAt), 'minutes');
    }
    return acc;
  }, 0);

  const stats = {
    avgListeningScore,
    avgReadingScore,
    avgWritingScore,
    avgSpeakingScore,
    overallIeltsBand: latestUserProgress?.ieltsScore ?? 0,
    avgMockInterviewScore,
    totalSessionsCompleted,
    totalQuizzesTaken,
    quizAccuracy,
    strongestSkill,
    weakestSkill,
    totalTimePracticed, // in minutes
  };

  // 2. Chart Data
  const ieltsScoreTrend = {
    listening: sessions
      .filter(
        (
          s,
        ): s is {
          id: string;
          userId: string;
          type: SessionType;
          startedAt: Date;
          endedAt: Date | null;
          score: number;
          transcript: string | null;
          feedback: Prisma.JsonValue | null;
        } => s.type === SessionType.IELTS_LISTENING && s.startedAt !== null && s.score !== null,
      )
      .map((s) => ({ date: s.startedAt, score: s.score })),
    reading: sessions
      .filter(
        (
          s,
        ): s is {
          id: string;
          userId: string;
          type: SessionType;
          startedAt: Date;
          endedAt: Date | null;
          score: number;
          transcript: string | null;
          feedback: Prisma.JsonValue | null;
        } => s.type === SessionType.IELTS_READING && s.startedAt !== null && s.score !== null,
      )
      .map((s) => ({ date: s.startedAt, score: s.score })),
    writing: writingSubmissions
      .filter(
        (
          s,
        ): s is {
          id: string;
          userId: string;
          sessionId: string | null;
          writingTaskId: string;
          writingTask: IELTSWritingTaskType;
          imageUrl: string;
          extractedText: string | null;
          score: number;
          feedback: Prisma.JsonValue | null;
          createdAt: Date;
        } => s.createdAt !== null && s.score !== null,
      )
      .map((s) => ({ date: s.createdAt, score: s.score })),
    speaking: sessions
      .filter(
        (
          s,
        ): s is {
          id: string;
          userId: string;
          type: SessionType;
          startedAt: Date;
          endedAt: Date | null;
          score: number;
          transcript: string | null;
          feedback: Prisma.JsonValue | null;
        } => s.type === SessionType.IELTS_SPEAKING && s.startedAt !== null && s.score !== null,
      )
      .map((s) => ({ date: s.startedAt, score: s.score })),
  };

  const skillBreakdown = [
    { skill: 'Listening', avgScore: avgListeningScore },
    { skill: 'Reading', avgScore: avgReadingScore },
    { skill: 'Writing', avgScore: avgWritingScore },
    { skill: 'Speaking', avgScore: avgSpeakingScore },
  ];

  const activityHeatmap = await prisma.session.groupBy({
    by: ['startedAt'],
    where: { userId },
    _count: {
      id: true,
    },
  });

  const quizPerformance = {
    correct: correctQuizAnswers,
    incorrect: quizAnswers.length - correctQuizAnswers,
  };

  const quizAnswersWithDifficulty = await prisma.quizAnswer.findMany({
    where: { quizAttempt: { userId } },
    include: { question: { select: { difficulty: true } } },
  });

  const performanceByDifficulty = quizAnswersWithDifficulty.reduce(
    (acc, answer) => {
      const difficulty = answer.question.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = { correct: 0, total: 0 };
      }
      if (answer.isCorrect) {
        acc[difficulty].correct++;
      }
      acc[difficulty].total++;
      return acc;
    },
    {} as Record<Difficulty, { correct: number; total: number }>,
  );

  const timeAllocationData = sessions.reduce(
    (acc, session) => {
      if (session.endedAt && session.startedAt) {
        const duration = moment(session.endedAt).diff(moment(session.startedAt), 'minutes');
        acc[session.type] = (acc[session.type] ?? 0) + duration;
      }
      return acc;
    },
    {} as Record<SessionType, number>,
  );

  const charts = {
    ieltsScoreTrend,
    skillBreakdown,
    activityHeatmap: activityHeatmap.map((d) => ({ date: d.startedAt, count: d._count.id })),
    quizPerformance,
    performanceByDifficulty: Object.entries(performanceByDifficulty).map(([difficulty, data]) => ({
      difficulty,
      ...data,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
    })),
    timeAllocation: Object.entries(timeAllocationData).map(([type, minutes]) => ({
      type,
      minutes,
    })),
  };

  return { stats, charts };
};

export const UserDashboardService = {
  getUserDashboardData,
};

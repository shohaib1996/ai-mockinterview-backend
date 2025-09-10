import { SessionType, Prisma } from '@prisma/client';
import { IAdminDashboardData } from './adminDashboard.interface';
import prisma from '@/app/lib/prisma';

const getAdminDashboardData = async (): Promise<IAdminDashboardData> => {
  // Stats
  const totalUsers = await prisma.user.count();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActiveUserIds = await prisma.session.findMany({
    where: { startedAt: { gte: sevenDaysAgo } },
    select: { userId: true },
    distinct: ['userId'],
  });
  const weeklyActiveUsers = weeklyActiveUserIds.length;
  const totalSessions = await prisma.session.count();
  const pendingWritingSubmissions = await prisma.writingSubmission.count({
    where: { feedback: { equals: Prisma.JsonNull } },
  });
  const totalMockInterviews = await prisma.session.count({
    where: {
      type: {
        in: [
          SessionType.MOCK_INTERVIEW_TECHNICAL,
          SessionType.MOCK_INTERVIEW_BEHAVIORAL,
          SessionType.MOCK_INTERVIEW_INTERPERSONAL,
        ],
      },
    },
  });
  const totalIeltsSessions = await prisma.session.count({
    where: {
      type: {
        in: [
          SessionType.IELTS_LISTENING,
          SessionType.IELTS_READING,
          SessionType.IELTS_SPEAKING,
          SessionType.IELTS_WRITING,
        ],
      },
    },
  });
  const totalQuestions = await prisma.question.count();
  const newUsersToday = await prisma.user.count({
    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });

  // Charts
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const userSignups = await prisma.user.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const userSignupsLast30Days = userSignups.map((item) => ({
    label: new Date(item.createdAt).toLocaleDateString(),
    value: item._count.id,
  }));

  const sessionTypeDistribution = (
    await prisma.session.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    })
  ).map((item) => ({ label: item.type, value: item._count.id }));

  const dailyActiveUsers = await prisma.session.groupBy({
    by: ['startedAt'],
    where: { startedAt: { gte: thirtyDaysAgo } },
    _count: {
      _all: true,
    },
  });

  const dailyActiveUsersLast30Days = dailyActiveUsers.map((item) => ({
    label: new Date(item.startedAt).toLocaleDateString(),
    value: item._count._all,
  }));

  const questionDifficultyDistribution = (
    await prisma.question.groupBy({
      by: ['difficulty'],
      _count: {
        id: true,
      },
    })
  ).map((item) => ({ label: item.difficulty, value: item._count.id }));

  const sessions = await prisma.session.findMany({
    select: { startedAt: true },
  });

  const userEngagementByHour = Array(24)
    .fill(0)
    .map((_, hour) => {
      const count = sessions.filter(
        (session) => new Date(session.startedAt).getUTCHours() === hour,
      ).length;
      return { label: `${hour}:00`, value: count };
    });

  const averageScoreBySessionType = (
    await prisma.session.groupBy({
      by: ['type'],
      _avg: {
        score: true,
      },
    })
  ).map((item) => ({ label: item.type, value: item._avg.score }));

  const aiVsManualQuestions = (
    await prisma.question.groupBy({
      by: ['aiGenerated'],
      _count: {
        id: true,
      },
    })
  ).map((item) => ({ label: item.aiGenerated ? 'AI Generated' : 'Manual', value: item._count.id }));

  const totalListeningAudio = await prisma.listeningAudio.count();
  const totalReadingPassage = await prisma.readingPassage.count();
  const completedListening = await prisma.userCompletionHistory.count({
    where: { listeningAudioId: { not: null } },
  });
  const completedReading = await prisma.userCompletionHistory.count({
    where: { readingPassageId: { not: null } },
  });

  return {
    stats: {
      totalUsers,
      weeklyActiveUsers,
      totalSessions,
      pendingWritingSubmissions,
      totalMockInterviews,
      totalIeltsSessions,
      totalQuestions,
      newUsersToday,
    },
    charts: {
      userSignupsLast30Days,
      sessionTypeDistribution,
      dailyActiveUsersLast30Days,
      questionDifficultyDistribution,
      userEngagementByHour,
      averageScoreBySessionType,
      aiVsManualQuestions,
      userCompletionHistory: {
        listening: { completed: completedListening, total: totalListeningAudio },
        reading: { completed: completedReading, total: totalReadingPassage },
      },
    },
  };
};

export const AdminDashboardServices = {
  getAdminDashboardData,
};

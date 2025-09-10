export interface IAdminDashboardStats {
  totalUsers: number;
  weeklyActiveUsers: number;
  totalSessions: number;
  pendingWritingSubmissions: number;
  totalMockInterviews: number;
  totalIeltsSessions: number;
  totalQuestions: number;
  newUsersToday: number;
}

export interface IChartData<T> {
  label: string;
  value: T;
}

export interface IAdminDashboardCharts {
  userSignupsLast30Days: IChartData<number>[];
  sessionTypeDistribution: IChartData<number>[];
  dailyActiveUsersLast30Days: IChartData<number>[];
  questionDifficultyDistribution: IChartData<number>[];
  userEngagementByHour: IChartData<number>[];
  averageScoreBySessionType: IChartData<number | null>[];
  aiVsManualQuestions: IChartData<number>[];
  userCompletionHistory: {
    listening: { completed: number; total: number };
    reading: { completed: number; total: number };
  };
}

export interface IAdminDashboardData {
  stats: IAdminDashboardStats;
  charts: IAdminDashboardCharts;
}

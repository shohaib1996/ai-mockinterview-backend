import express from 'express';

const router = express.Router();

import { UserRoutes } from '../modules/users/user.routes';
import { SessionRoutes } from '../modules/session/session.routes';
import { ListeningAudioRoutes } from '../modules/listeningAudio/listeningAudio.routes';
import { ReadingPassageRoutes } from '../modules/readingPassage/readingPassage.routes';
import { QuestionRoutes } from '../modules/question/question.routes';
import { AnswerRoutes } from '../modules/answer/answer.routes';
import { QuizAttemptRoutes } from '../modules/quizAttempt/quizAttempt.routes';
import { QuizAnswerRoutes } from '../modules/quizAnswer/quizAnswer.routes';
import { WritingSubmissionRoutes } from '../modules/writingSubmission/writingSubmission.routes';
import { UserProgressRoutes } from '../modules/userProgress/userProgress.routes';
import { FileUploadRoutes } from '../modules/file-upload/file-upload.routes';
import { TextExtractionRoutes } from '../modules/text-extraction/text-extraction.routes';
import { AiChatRoutes } from '../modules/ai-chat/ai-chat.routes';
import { MockInterviewRoutes } from '../modules/mock-interview/mock-interview.routes';
import { UserDashboardRoutes } from '../modules/userDashboard/userDashboard.routes';
import { WritingTaskRoutes } from '../modules/writingTask/writingTask.routes';
import { AdminDashboardRoutes } from '../modules/adminDashboard/adminDashboard.routes';

const moduleRoutes = [
  {
    path: '/ai-chat',
    route: AiChatRoutes,
  },
  {
    path: '/mock-interview',
    route: MockInterviewRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/sessions',
    route: SessionRoutes,
  },
  {
    path: '/listening-audios',
    route: ListeningAudioRoutes,
  },
  {
    path: '/reading-passages',
    route: ReadingPassageRoutes,
  },
  {
    path: '/questions',
    route: QuestionRoutes,
  },
  {
    path: '/answers',
    route: AnswerRoutes,
  },
  {
    path: '/quiz-attempts',
    route: QuizAttemptRoutes,
  },
  {
    path: '/quiz-answers',
    route: QuizAnswerRoutes,
  },
  {
    path: '/writing-submissions',
    route: WritingSubmissionRoutes,
  },
  {
    path: '/user-progress',
    route: UserProgressRoutes,
  },
  {
    path: '/upload',
    route: FileUploadRoutes,
  },
  {
    path: '/extract-text',
    route: TextExtractionRoutes,
  },
  {
    path: '/dashboard',
    route: UserDashboardRoutes,
  },
  {
    path: '/admin-dashboard',
    route: AdminDashboardRoutes,
  },
  {
    path: '/writing-tasks',
    route: WritingTaskRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

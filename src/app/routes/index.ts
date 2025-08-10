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

const moduleRoutes = [
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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

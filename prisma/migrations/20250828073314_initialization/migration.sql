-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."SessionType" AS ENUM ('IELTS_LISTENING', 'IELTS_READING', 'IELTS_SPEAKING', 'IELTS_WRITING', 'MOCK_INTERVIEW_TECHNICAL', 'MOCK_INTERVIEW_BEHAVIORAL', 'MOCK_INTERVIEW_INTERPERSONAL', 'QUIZ');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MCQ', 'OPEN_ENDED');

-- CreateEnum
CREATE TYPE "public"."IELTSWritingTaskType" AS ENUM ('TASK1', 'TASK2');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."SessionType" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "transcript" TEXT,
    "feedback" JSONB,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ListeningAudio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningAudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingPassage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "sessionType" "public"."SessionType" NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listeningAudioId" TEXT,
    "readingPassageId" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Answer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAnswer" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" TEXT,
    "answerText" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WritingTask" (
    "id" TEXT NOT NULL,
    "task" "public"."IELTSWritingTaskType" NOT NULL,
    "promptText" TEXT NOT NULL,
    "imageUrl" TEXT,
    "difficulty" "public"."Difficulty",

    CONSTRAINT "WritingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WritingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "writingTaskId" TEXT NOT NULL,
    "extractedText" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ieltsScore" DOUBLE PRECISION,
    "interviewScore" DOUBLE PRECISION,
    "quizScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIChatConversation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "conversation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompletionHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listeningAudioId" TEXT,
    "readingPassageId" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "UserCompletionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Answer_sessionId_idx" ON "public"."Answer"("sessionId");

-- CreateIndex
CREATE INDEX "QuizAnswer_quizAttemptId_idx" ON "public"."QuizAnswer"("quizAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_date_key" ON "public"."UserProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "AIChatConversation_sessionId_idx" ON "public"."AIChatConversation"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompletionHistory_userId_listeningAudioId_key" ON "public"."UserCompletionHistory"("userId", "listeningAudioId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompletionHistory_userId_readingPassageId_key" ON "public"."UserCompletionHistory"("userId", "readingPassageId");

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_listeningAudioId_fkey" FOREIGN KEY ("listeningAudioId") REFERENCES "public"."ListeningAudio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_readingPassageId_fkey" FOREIGN KEY ("readingPassageId") REFERENCES "public"."ReadingPassage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "public"."QuizAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WritingSubmission" ADD CONSTRAINT "WritingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WritingSubmission" ADD CONSTRAINT "WritingSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WritingSubmission" ADD CONSTRAINT "WritingSubmission_writingTaskId_fkey" FOREIGN KEY ("writingTaskId") REFERENCES "public"."WritingTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIChatConversation" ADD CONSTRAINT "AIChatConversation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_listeningAudioId_fkey" FOREIGN KEY ("listeningAudioId") REFERENCES "public"."ListeningAudio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_readingPassageId_fkey" FOREIGN KEY ("readingPassageId") REFERENCES "public"."ReadingPassage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

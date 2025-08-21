/*
  Warnings:

  - You are about to drop the column `testPart` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `currentQuestionNumber` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `currentTestPart` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "testPart";

-- AlterTable
ALTER TABLE "public"."Session" DROP COLUMN "currentQuestionNumber",
DROP COLUMN "currentTestPart",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."TestStatus";

-- CreateTable
CREATE TABLE "public"."UserListeningHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listeningAudioId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "UserListeningHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserListeningHistory_userId_listeningAudioId_key" ON "public"."UserListeningHistory"("userId", "listeningAudioId");

-- AddForeignKey
ALTER TABLE "public"."UserListeningHistory" ADD CONSTRAINT "UserListeningHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserListeningHistory" ADD CONSTRAINT "UserListeningHistory_listeningAudioId_fkey" FOREIGN KEY ("listeningAudioId") REFERENCES "public"."ListeningAudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserListeningHistory" ADD CONSTRAINT "UserListeningHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

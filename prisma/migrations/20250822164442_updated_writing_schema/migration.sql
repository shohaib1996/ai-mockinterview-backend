/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `WritingSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `writingTask` on the `WritingSubmission` table. All the data in the column will be lost.
  - Added the required column `writingTaskId` to the `WritingSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."IELTSWritingTaskType" AS ENUM ('TASK1', 'TASK2');

-- AlterTable
ALTER TABLE "public"."WritingSubmission" DROP COLUMN "imageUrl",
DROP COLUMN "writingTask",
ADD COLUMN     "writingTaskId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."IELTSWritingTask";

-- CreateTable
CREATE TABLE "public"."WritingTask" (
    "id" TEXT NOT NULL,
    "task" "public"."IELTSWritingTaskType" NOT NULL,
    "promptText" TEXT NOT NULL,
    "imageUrl" TEXT,
    "difficulty" "public"."Difficulty",

    CONSTRAINT "WritingTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WritingSubmission" ADD CONSTRAINT "WritingSubmission_writingTaskId_fkey" FOREIGN KEY ("writingTaskId") REFERENCES "public"."WritingTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."GenerationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."QuestionType" ADD VALUE 'TRUE_FALSE_NOT_GIVEN';
ALTER TYPE "public"."QuestionType" ADD VALUE 'MATCHING';
ALTER TYPE "public"."QuestionType" ADD VALUE 'COMPLETION';
ALTER TYPE "public"."QuestionType" ADD VALUE 'SHORT_ANSWER';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "acceptableAnswers" TEXT[];

-- CreateTable
CREATE TABLE "public"."GenerationLog" (
    "id" TEXT NOT NULL,
    "skill" "public"."SessionType" NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL,
    "status" "public"."GenerationStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationLog_skill_createdAt_idx" ON "public"."GenerationLog"("skill", "createdAt");

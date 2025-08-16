-- CreateEnum
CREATE TYPE "public"."TestStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "testPart" INTEGER;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "currentQuestionNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "currentTestPart" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "public"."TestStatus" NOT NULL DEFAULT 'NOT_STARTED';

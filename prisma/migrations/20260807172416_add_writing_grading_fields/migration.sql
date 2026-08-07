-- AlterTable
ALTER TABLE "public"."WritingSubmission" ADD COLUMN     "criteriaScores" JSONB,
ADD COLUMN     "wordCount" INTEGER;

-- AlterTable
ALTER TABLE "public"."WritingTask" ADD COLUMN     "chartConfig" JSONB;

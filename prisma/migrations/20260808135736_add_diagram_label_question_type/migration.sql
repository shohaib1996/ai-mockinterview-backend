-- AlterEnum
ALTER TYPE "public"."QuestionType" ADD VALUE 'DIAGRAM_LABEL';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "imageUrl" TEXT;

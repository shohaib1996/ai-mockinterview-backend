-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "quizAttemptId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "public"."QuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

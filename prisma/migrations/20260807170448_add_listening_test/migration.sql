-- CreateEnum
CREATE TYPE "public"."ListeningContext" AS ENUM ('SOCIAL_CONVERSATION', 'SOCIAL_MONOLOGUE', 'EDUCATIONAL_CONVERSATION', 'ACADEMIC_MONOLOGUE');

-- AlterTable
ALTER TABLE "public"."ListeningAudio" ADD COLUMN     "context" "public"."ListeningContext",
ADD COLUMN     "listeningTestId" TEXT,
ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "listeningTestId" TEXT;

-- CreateTable
CREATE TABLE "public"."ListeningTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_listeningTestId_fkey" FOREIGN KEY ("listeningTestId") REFERENCES "public"."ListeningTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListeningAudio" ADD CONSTRAINT "ListeningAudio_listeningTestId_fkey" FOREIGN KEY ("listeningTestId") REFERENCES "public"."ListeningTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

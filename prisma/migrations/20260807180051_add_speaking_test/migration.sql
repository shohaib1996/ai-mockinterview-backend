-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "speakingTestId" TEXT;

-- CreateTable
CREATE TABLE "public"."SpeakingTest" (
    "id" TEXT NOT NULL,
    "part1Topic" TEXT NOT NULL,
    "part1Questions" TEXT[],
    "cueCardTopic" TEXT NOT NULL,
    "cueCardBullets" TEXT[],
    "part3Questions" TEXT[],
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_speakingTestId_fkey" FOREIGN KEY ("speakingTestId") REFERENCES "public"."SpeakingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."ReadingPassage" ADD COLUMN     "order" INTEGER,
ADD COLUMN     "readingTestId" TEXT;

-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "readingTestId" TEXT;

-- CreateTable
CREATE TABLE "public"."ReadingTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingTest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_readingTestId_fkey" FOREIGN KEY ("readingTestId") REFERENCES "public"."ReadingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingPassage" ADD CONSTRAINT "ReadingPassage_readingTestId_fkey" FOREIGN KEY ("readingTestId") REFERENCES "public"."ReadingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

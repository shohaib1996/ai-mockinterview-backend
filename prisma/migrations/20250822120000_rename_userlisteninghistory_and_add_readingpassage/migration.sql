-- AlterTable
ALTER TABLE "UserListeningHistory" RENAME TO "UserCompletionHistory";

-- AlterColumn
ALTER TABLE "UserCompletionHistory" ALTER COLUMN "listeningAudioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserCompletionHistory" ADD COLUMN "readingPassageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserCompletionHistory_userId_readingPassageId_key" ON "UserCompletionHistory"("userId", "readingPassageId");

-- AddForeignKey
ALTER TABLE "UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_readingPassageId_fkey" FOREIGN KEY ("readingPassageId") REFERENCES "ReadingPassage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
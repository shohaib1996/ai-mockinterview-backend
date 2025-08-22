-- DropForeignKey
ALTER TABLE "public"."UserCompletionHistory" DROP CONSTRAINT "UserListeningHistory_listeningAudioId_fkey";

-- AlterTable
ALTER TABLE "public"."UserCompletionHistory" RENAME CONSTRAINT "UserListeningHistory_pkey" TO "UserCompletionHistory_pkey";

-- RenameForeignKey
ALTER TABLE "public"."UserCompletionHistory" RENAME CONSTRAINT "UserListeningHistory_sessionId_fkey" TO "UserCompletionHistory_sessionId_fkey";

-- RenameForeignKey
ALTER TABLE "public"."UserCompletionHistory" RENAME CONSTRAINT "UserListeningHistory_userId_fkey" TO "UserCompletionHistory_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."UserCompletionHistory" ADD CONSTRAINT "UserCompletionHistory_listeningAudioId_fkey" FOREIGN KEY ("listeningAudioId") REFERENCES "public"."ListeningAudio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."UserListeningHistory_userId_listeningAudioId_key" RENAME TO "UserCompletionHistory_userId_listeningAudioId_key";

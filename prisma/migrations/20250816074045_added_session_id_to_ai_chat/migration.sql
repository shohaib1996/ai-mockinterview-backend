/*
  Warnings:

  - You are about to drop the column `userId` on the `AIChatConversation` table. All the data in the column will be lost.
  - Added the required column `sessionId` to the `AIChatConversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AIChatConversation" DROP CONSTRAINT "AIChatConversation_userId_fkey";

-- DropIndex
DROP INDEX "public"."AIChatConversation_userId_idx";

-- AlterTable
ALTER TABLE "public"."AIChatConversation" DROP COLUMN "userId",
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AIChatConversation_sessionId_idx" ON "public"."AIChatConversation"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."AIChatConversation" ADD CONSTRAINT "AIChatConversation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

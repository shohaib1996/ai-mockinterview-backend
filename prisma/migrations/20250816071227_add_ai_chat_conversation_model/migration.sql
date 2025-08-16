-- CreateTable
CREATE TABLE "public"."AIChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversation" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIChatConversation_userId_idx" ON "public"."AIChatConversation"("userId");

-- AddForeignKey
ALTER TABLE "public"."AIChatConversation" ADD CONSTRAINT "AIChatConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

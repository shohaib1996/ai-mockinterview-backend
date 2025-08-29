-- CreateTable
CREATE TABLE "public"."CustomQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "asked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomQuestion_sessionId_idx" ON "public"."CustomQuestion"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."CustomQuestion" ADD CONSTRAINT "CustomQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

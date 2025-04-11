-- CreateTable
CREATE TABLE "club_messages" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "club_messages" ADD CONSTRAINT "club_messages_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_messages" ADD CONSTRAINT "club_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "club_messages_club_id_idx" ON "club_messages"("club_id");
CREATE INDEX "club_messages_user_id_idx" ON "club_messages"("user_id");
CREATE INDEX "club_messages_created_at_idx" ON "club_messages"("created_at"); 
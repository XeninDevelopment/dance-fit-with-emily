-- Public review submissions await moderation before appearing on the site.
ALTER TABLE "Review" ADD COLUMN "pending" BOOLEAN NOT NULL DEFAULT false;

-- Filter the moderation queue efficiently.
CREATE INDEX "Review_pending_idx" ON "Review"("pending");

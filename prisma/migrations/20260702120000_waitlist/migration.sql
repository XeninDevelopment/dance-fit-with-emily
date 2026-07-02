-- Waitlist for full classes + tiered first-access offers for freed spots.
CREATE TYPE "OfferStatus" AS ENUM ('HELD', 'CLAIMED', 'EXPIRED');

CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "offeredAt" TIMESTAMP(3),
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaitlistEntry_classId_email_key" ON "WaitlistEntry"("classId", "email");
CREATE INDEX "WaitlistEntry_classId_position_idx" ON "WaitlistEntry"("classId", "position");

ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SpotOffer" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'HELD',
    "tier" INTEGER NOT NULL DEFAULT 1,
    "holderEntryId" TEXT,
    "tier1ExpiresAt" TIMESTAMP(3) NOT NULL,
    "tier2ExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpotOffer_claimToken_key" ON "SpotOffer"("claimToken");
CREATE INDEX "SpotOffer_classId_status_idx" ON "SpotOffer"("classId", "status");
CREATE INDEX "SpotOffer_status_tier1ExpiresAt_idx" ON "SpotOffer"("status", "tier1ExpiresAt");
CREATE INDEX "SpotOffer_status_tier2ExpiresAt_idx" ON "SpotOffer"("status", "tier2ExpiresAt");

ALTER TABLE "SpotOffer" ADD CONSTRAINT "SpotOffer_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seat reservations: a SpotHold reserves a spot during checkout (and, later, for waitlist
-- offers) so concurrent buyers can't oversell a class and freed spots can be held.
CREATE TABLE "SpotHold" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpotHold_paymentIntentId_key" ON "SpotHold"("paymentIntentId");
CREATE INDEX "SpotHold_classId_expiresAt_idx" ON "SpotHold"("classId", "expiresAt");

ALTER TABLE "SpotHold" ADD CONSTRAINT "SpotHold_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

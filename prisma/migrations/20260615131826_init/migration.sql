-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "danceType" TEXT NOT NULL,
    "classDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "clientSecret" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_token_key" ON "Booking"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentIntentId_key" ON "Booking"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

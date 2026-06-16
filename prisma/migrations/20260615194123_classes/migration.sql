/*
  Warnings:

  - You are about to drop the column `amount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `classDateTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `danceType` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `classId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_token_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "amount",
DROP COLUMN "classDateTime",
DROP COLUMN "currency",
DROP COLUMN "danceType",
DROP COLUMN "location",
DROP COLUMN "token",
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "manual" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "danceType" TEXT NOT NULL,
    "classDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "capacity" INTEGER,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_token_key" ON "Class"("token");

-- CreateIndex
CREATE INDEX "Class_classDateTime_idx" ON "Class"("classDateTime");

-- CreateIndex
CREATE INDEX "Booking_classId_idx" ON "Booking"("classId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

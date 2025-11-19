/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Bill` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "billType" ADD VALUE 'MAINTENANCE';
ALTER TYPE "billType" ADD VALUE 'INTERNET';
ALTER TYPE "billType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "ownerId",
ALTER COLUMN "dateSent" SET DEFAULT CURRENT_TIMESTAMP;

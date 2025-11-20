/*
  Warnings:

  - Made the column `leaseEnd` on table `Tenant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `leaseStart` on table `Tenant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "leaseEnd" SET NOT NULL,
ALTER COLUMN "leaseStart" SET NOT NULL;

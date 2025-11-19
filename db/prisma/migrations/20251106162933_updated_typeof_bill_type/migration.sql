/*
  Warnings:

  - Changed the type of `billType` on the `Bill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "billType",
ADD COLUMN     "billType" TEXT NOT NULL;

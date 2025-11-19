/*
  Warnings:

  - You are about to drop the column `unitNameOrNumber` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "unitNameOrNumber";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "name",
ADD COLUMN     "unitName" TEXT NOT NULL DEFAULT 'Shanti nivas';

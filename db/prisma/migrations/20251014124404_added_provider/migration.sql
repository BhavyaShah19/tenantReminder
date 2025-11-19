-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'CREDENTIALS');

-- DropIndex
DROP INDEX "public"."Owner_username_key";

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "provider" "Provider",
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

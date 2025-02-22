-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLEB', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PLEB';

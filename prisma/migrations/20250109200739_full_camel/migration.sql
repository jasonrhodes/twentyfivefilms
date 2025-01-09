/*
  Warnings:

  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `slackuser_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `hashed_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword",
DROP COLUMN "slackuser_id",
ADD COLUMN     "hashed_password" TEXT NOT NULL,
ADD COLUMN     "slack_user_id" TEXT;

/*
  Warnings:

  - The primary key for the `ListEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ranking_id` on the `ListEntry` table. All the data in the column will be lost.
  - The primary key for the `Ranking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Ranking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,ranking_slug,type,order]` on the table `ListEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ranking_slug` to the `ListEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ListEntry" DROP CONSTRAINT "ListEntry_ranking_id_fkey";

-- DropIndex
DROP INDEX "ListEntry_user_id_ranking_id_type_order_key";

-- DropIndex
DROP INDEX "Ranking_slug_key";

-- AlterTable
ALTER TABLE "ListEntry" DROP CONSTRAINT "ListEntry_pkey",
DROP COLUMN "ranking_id",
ADD COLUMN     "ranking_slug" TEXT NOT NULL,
ADD CONSTRAINT "ListEntry_pkey" PRIMARY KEY ("movie_id", "ranking_slug", "user_id");

-- AlterTable
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Ranking_pkey" PRIMARY KEY ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ListEntry_user_id_ranking_slug_type_order_key" ON "ListEntry"("user_id", "ranking_slug", "type", "order");

-- AddForeignKey
ALTER TABLE "ListEntry" ADD CONSTRAINT "ListEntry_ranking_slug_fkey" FOREIGN KEY ("ranking_slug") REFERENCES "Ranking"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

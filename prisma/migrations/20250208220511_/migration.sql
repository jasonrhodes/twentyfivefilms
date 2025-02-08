/*
  Warnings:

  - The primary key for the `ListEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,ranking_id,type,order]` on the table `ListEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ranking_id` on table `ListEntry` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `is_ordered` to the `Ranking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ListEntry_user_id_type_order_key";

-- AlterTable
ALTER TABLE "ListEntry" DROP CONSTRAINT "ListEntry_pkey",
ALTER COLUMN "ranking_id" SET NOT NULL,
ADD CONSTRAINT "ListEntry_pkey" PRIMARY KEY ("movie_id", "ranking_id", "user_id");

-- AlterTable
ALTER TABLE "Ranking" ADD COLUMN     "favorites_max" INTEGER,
ADD COLUMN     "hms_max" INTEGER,
ADD COLUMN     "is_ordered" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ListEntry_user_id_ranking_id_type_order_key" ON "ListEntry"("user_id", "ranking_id", "type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_slug_key" ON "Ranking"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_name_key" ON "Ranking"("name");

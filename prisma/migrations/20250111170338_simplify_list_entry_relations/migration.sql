/*
  Warnings:

  - You are about to drop the `List` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoviesOnList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MoviesOnList" DROP CONSTRAINT "MoviesOnList_list_id_fkey";

-- DropForeignKey
ALTER TABLE "MoviesOnList" DROP CONSTRAINT "MoviesOnList_movie_id_fkey";

-- DropTable
DROP TABLE "List";

-- DropTable
DROP TABLE "MoviesOnList";

-- CreateTable
CREATE TABLE "ListEntry" (
    "movie_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "MovieListType" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ListEntry_pkey" PRIMARY KEY ("movie_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListEntry_user_id_type_order_key" ON "ListEntry"("user_id", "type", "order");

-- AddForeignKey
ALTER TABLE "ListEntry" ADD CONSTRAINT "ListEntry_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListEntry" ADD CONSTRAINT "ListEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ListEntry" ADD COLUMN     "ranking_id" INTEGER;

-- CreateTable
CREATE TABLE "Ranking" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListEntry" ADD CONSTRAINT "ListEntry_ranking_id_fkey" FOREIGN KEY ("ranking_id") REFERENCES "Ranking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

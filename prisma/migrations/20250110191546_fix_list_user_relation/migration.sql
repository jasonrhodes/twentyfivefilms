/*
  Warnings:

  - You are about to drop the `ListsOnUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ListsOnUser" DROP CONSTRAINT "ListsOnUser_list_id_fkey";

-- DropForeignKey
ALTER TABLE "ListsOnUser" DROP CONSTRAINT "ListsOnUser_user_id_fkey";

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ListsOnUser";

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

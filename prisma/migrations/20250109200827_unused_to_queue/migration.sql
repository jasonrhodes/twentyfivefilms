/*
  Warnings:

  - The values [UNUSED] on the enum `MovieListType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MovieListType_new" AS ENUM ('FAVORITE', 'HM', 'QUEUE');
ALTER TABLE "List" ALTER COLUMN "type" TYPE "MovieListType_new" USING ("type"::text::"MovieListType_new");
ALTER TYPE "MovieListType" RENAME TO "MovieListType_old";
ALTER TYPE "MovieListType_new" RENAME TO "MovieListType";
DROP TYPE "MovieListType_old";
COMMIT;

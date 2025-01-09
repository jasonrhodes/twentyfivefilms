-- CreateEnum
CREATE TYPE "MovieListType" AS ENUM ('FAVORITE', 'HM', 'UNUSED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('AUTH');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "slackuser_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "type" "MovieListType" NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoviesOnList" (
    "movie_id" INTEGER NOT NULL,
    "list_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "MoviesOnList_pkey" PRIMARY KEY ("movie_id","list_id")
);

-- CreateTable
CREATE TABLE "ListsOnUser" (
    "list_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ListsOnUser_pkey" PRIMARY KEY ("list_id","user_id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "type" "TokenType" NOT NULL DEFAULT 'AUTH',

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "release_date" DATE NOT NULL,
    "poster_path" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "MoviesOnList" ADD CONSTRAINT "MoviesOnList_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoviesOnList" ADD CONSTRAINT "MoviesOnList_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListsOnUser" ADD CONSTRAINT "ListsOnUser_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListsOnUser" ADD CONSTRAINT "ListsOnUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

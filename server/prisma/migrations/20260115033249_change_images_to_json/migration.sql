/*
  Warnings:

  - You are about to alter the column `images` on the `comments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `tags` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `comments` MODIFY `images` JSON NULL;

-- AlterTable
ALTER TABLE `posts` MODIFY `tags` JSON NULL;

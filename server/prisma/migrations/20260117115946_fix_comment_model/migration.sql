-- AlterTable
ALTER TABLE `comments` ADD COLUMN `isReply` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `replyCount` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `comments_parentId_idx` ON `comments`(`parentId`);

-- CreateIndex
CREATE INDEX `comments_createdAt_idx` ON `comments`(`createdAt`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

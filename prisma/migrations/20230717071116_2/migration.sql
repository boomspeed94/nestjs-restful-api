/*
  Warnings:

  - You are about to drop the column `alternative_text` on the `mest_files` table. All the data in the column will be lost.
  - You are about to drop the column `preview_url` on the `mest_files` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `mest_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mest_files" DROP COLUMN "alternative_text",
DROP COLUMN "preview_url",
DROP COLUMN "provider",
ADD COLUMN     "user_id" VARCHAR(16);

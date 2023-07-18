-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('User');

-- CreateTable
CREATE TABLE "nest_users" (
    "id" VARCHAR(16) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "createAt" BIGINT NOT NULL DEFAULT 0,
    "updateAt" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "nest_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mest_files" (
    "id" VARCHAR(16) NOT NULL,
    "create_at" BIGINT NOT NULL DEFAULT 0,
    "update_at" BIGINT NOT NULL DEFAULT 0,
    "delete_at" BIGINT NOT NULL DEFAULT 0,
    "filename" TEXT,
    "alternative_text" TEXT,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "formats" JSONB,
    "ext" TEXT,
    "mime" TEXT,
    "size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "url" VARCHAR(500) NOT NULL,
    "preview_url" VARCHAR(500),
    "provider" TEXT,

    CONSTRAINT "mest_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nest_medias" (
    "id" VARCHAR(16) NOT NULL,
    "file_id" TEXT NOT NULL,
    "related_id" VARCHAR(16) NOT NULL,
    "related_type" "EntityType" NOT NULL,
    "field" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "nest_medias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nest_users_email_key" ON "nest_users"("email");

-- AddForeignKey
ALTER TABLE "nest_medias" ADD CONSTRAINT "nest_medias_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "mest_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

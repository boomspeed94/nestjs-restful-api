-- CreateTable
CREATE TABLE "nest_users" (
    "id" VARCHAR(16) NOT NULL DEFAULT null,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "createAt" BIGINT NOT NULL DEFAULT 0,
    "updateAt" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "nest_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mest_uploads" (
    "id" VARCHAR(16) NOT NULL DEFAULT null,
    "createAt" BIGINT NOT NULL DEFAULT 0,
    "updateAt" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "mest_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nest_users_email_key" ON "nest_users"("email");

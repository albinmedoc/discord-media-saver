-- CreateTable
CREATE TABLE "file_hashes" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "hash" CHAR(32) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_hashes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_hashes_filename_key" ON "file_hashes"("filename");

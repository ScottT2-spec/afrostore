-- CreateTable
CREATE TABLE "generated_files" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_files_siteId_idx" ON "generated_files"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_files_siteId_path_key" ON "generated_files"("siteId", "path");

-- AddForeignKey
ALTER TABLE "generated_files" ADD CONSTRAINT "generated_files_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

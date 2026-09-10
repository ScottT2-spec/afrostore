-- Publish flow for AI-generated real-code storefronts.
ALTER TABLE "sites"
  ADD COLUMN "codeGenPublished" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "codeGenPublishedAt" TIMESTAMP(3),
  ADD COLUMN "codeGenBuildPath" TEXT;

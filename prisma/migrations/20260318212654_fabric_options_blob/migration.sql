-- CreateTable
CREATE TABLE "FabricOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FabricOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FabricOption_sortOrder_createdAt_idx" ON "FabricOption"("sortOrder", "createdAt");

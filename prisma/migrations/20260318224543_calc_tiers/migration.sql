-- CreateTable
CREATE TABLE "CalcTier" (
    "id" TEXT NOT NULL,
    "minSqft" INTEGER NOT NULL,
    "maxSqft" INTEGER NOT NULL,
    "pricePerSqft" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalcTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalcTier_minSqft_maxSqft_createdAt_idx" ON "CalcTier"("minSqft", "maxSqft", "createdAt");

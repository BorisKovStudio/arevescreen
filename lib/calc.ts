import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const CALC_CACHE_TAG = 'calc';

export type PublicCalcTier = {
  id: string;
  minSqft: number;
  maxSqft: number;
  pricePerSqft: number;
};

export type AdminCalcTier = PublicCalcTier & {
  createdAt: Date;
};

const calcTierOrder = [{ minSqft: 'asc' as const }, { maxSqft: 'asc' as const }, { createdAt: 'asc' as const }];

function formatExclusiveUpperSqft(maxSqft: number) {
  return (maxSqft - 0.1).toFixed(1);
}

export function formatCalcRangeLabel(minSqft: number, maxSqft: number) {
  return `${minSqft}-${formatExclusiveUpperSqft(maxSqft)} sqft`;
}

const getCachedCalcTiers = unstable_cache(
  async (): Promise<PublicCalcTier[]> => {
    return prisma.calcTier.findMany({
      orderBy: calcTierOrder,
      select: {
        id: true,
        minSqft: true,
        maxSqft: true,
        pricePerSqft: true,
      },
    });
  },
  ['calc'],
  {
    tags: [CALC_CACHE_TAG],
  },
);

export async function getCalcTiers() {
  return getCachedCalcTiers();
}

export async function getAdminCalcTiers(): Promise<AdminCalcTier[]> {
  return prisma.calcTier.findMany({
    orderBy: calcTierOrder,
    select: {
      id: true,
      minSqft: true,
      maxSqft: true,
      pricePerSqft: true,
      createdAt: true,
    },
  });
}

export function getCalcCoverageIssues(
  tiers: Array<{ minSqft: number; maxSqft: number; pricePerSqft: number }>,
) {
  const issues: string[] = [];

  if (tiers.length === 0) {
    issues.push('Add at least one calc period with a price to enable estimate preview on the website.');
    return issues;
  }

  const sortedTiers = [...tiers].sort(
    (left, right) => left.minSqft - right.minSqft || left.maxSqft - right.maxSqft,
  );

  const firstTier = sortedTiers[0];
  if (firstTier.minSqft > 1) {
    issues.push(`No price configured for ${formatCalcRangeLabel(1, firstTier.minSqft)}.`);
  }

  for (let index = 0; index < sortedTiers.length - 1; index += 1) {
    const currentTier = sortedTiers[index];
    const nextTier = sortedTiers[index + 1];

    if (currentTier.maxSqft > nextTier.minSqft) {
      issues.push(
        `Calc periods overlap: ${formatCalcRangeLabel(currentTier.minSqft, currentTier.maxSqft)} and ${formatCalcRangeLabel(nextTier.minSqft, nextTier.maxSqft)}.`,
      );
      continue;
    }

    if (currentTier.maxSqft < nextTier.minSqft) {
      issues.push(`No price configured for ${formatCalcRangeLabel(currentTier.maxSqft, nextTier.minSqft)}.`);
    }
  }

  return issues;
}

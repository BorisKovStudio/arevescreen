import { unstable_cache } from 'next/cache';
import type { FabricOption as SiteFabricOption } from '@/data/siteContent';
import { fabricOptions as fallbackFabricOptions } from '@/data/siteContent';
import { prisma } from '@/lib/prisma';

export const FABRIC_OPTIONS_CACHE_TAG = 'fabric-options';

export type AdminFabricOption = {
  id: string;
  label: string;
  imageUrl: string;
  blobPathname: string;
  sortOrder: number;
  createdAt: Date;
};

const getCachedFabricOptions = unstable_cache(
  async (): Promise<SiteFabricOption[]> => {
    const options = await prisma.fabricOption.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        label: true,
        imageUrl: true,
      },
    });

    if (options.length === 0) {
      return fallbackFabricOptions;
    }

    return options.map((option) => ({
      label: option.label,
      image: option.imageUrl,
    }));
  },
  ['fabric-options'],
  {
    tags: [FABRIC_OPTIONS_CACHE_TAG],
  },
);

export async function getFabricOptions() {
  return getCachedFabricOptions();
}

export async function getAdminFabricOptions(): Promise<AdminFabricOption[]> {
  return prisma.fabricOption.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      label: true,
      imageUrl: true,
      blobPathname: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

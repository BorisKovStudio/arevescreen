import { unstable_cache } from 'next/cache';
import { heroSlides as fallbackHeroSlides } from '@/data/siteContent';
import { prisma } from '@/lib/prisma';

export const HERO_SLIDES_CACHE_TAG = 'hero-slides';

export type AdminHeroSlide = {
  id: string;
  imageUrl: string;
  blobPathname: string;
  sortOrder: number;
  createdAt: Date;
};

const getCachedHeroSlideUrls = unstable_cache(
  async () => {
    const slides = await prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        imageUrl: true,
      },
    });

    if (slides.length === 0) {
      return fallbackHeroSlides;
    }

    return slides.map((slide) => slide.imageUrl);
  },
  ['hero-slides'],
  {
    tags: [HERO_SLIDES_CACHE_TAG],
  },
);

export async function getHeroSlideUrls() {
  return getCachedHeroSlideUrls();
}

export async function getAdminHeroSlides(): Promise<AdminHeroSlide[]> {
  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      imageUrl: true,
      blobPathname: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

import { unstable_cache } from 'next/cache';
import type { ProjectItem as SiteProjectItem } from '@/data/siteContent';
import { projects as fallbackProjects } from '@/data/siteContent';
import { prisma } from '@/lib/prisma';

export const PROJECTS_CACHE_TAG = 'projects';
export const PROJECT_TITLE_MAX_LENGTH = 24;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 160;
export const PROJECTS_MAX_COUNT = 6;

export type AdminProject = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  coverBlobPathname: string;
  galleryImageUrls: string[];
  galleryBlobPathnames: string[];
  sortOrder: number;
  createdAt: Date;
};

const getCachedProjects = unstable_cache(
  async (): Promise<SiteProjectItem[]> => {
    const items = await prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        title: true,
        description: true,
        coverImageUrl: true,
        galleryImageUrls: true,
      },
    });

    if (items.length === 0) {
      return fallbackProjects;
    }

    return items.map((item) => ({
      title: item.title,
      description: item.description,
      cover: item.coverImageUrl,
      gallery: item.galleryImageUrls,
    }));
  },
  ['projects'],
  {
    tags: [PROJECTS_CACHE_TAG],
  },
);

export async function getProjects() {
  return getCachedProjects();
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      coverBlobPathname: true,
      galleryImageUrls: true,
      galleryBlobPathnames: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

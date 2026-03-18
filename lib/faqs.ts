import { unstable_cache } from 'next/cache';
import type { FaqItem as SiteFaqItem } from '@/data/siteContent';
import { faqItems as fallbackFaqItems } from '@/data/siteContent';
import { prisma } from '@/lib/prisma';

export const FAQS_CACHE_TAG = 'faqs';
export const FAQS_MAX_COUNT = 10;
export const FAQ_QUESTION_MAX_LENGTH = 90;
export const FAQ_ANSWER_MAX_LENGTH = 180;

export type AdminFaqEntry = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: Date;
};

const getCachedFaqItems = unstable_cache(
  async (): Promise<SiteFaqItem[]> => {
    const items = await prisma.faqEntry.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        question: true,
        answer: true,
      },
    });

    if (items.length === 0) {
      return fallbackFaqItems;
    }

    return items.map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
  },
  ['faqs'],
  {
    tags: [FAQS_CACHE_TAG],
  },
);

export async function getFaqItems() {
  return getCachedFaqItems();
}

export async function getAdminFaqEntries(): Promise<AdminFaqEntry[]> {
  return prisma.faqEntry.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      question: true,
      answer: true,
      sortOrder: true,
      createdAt: true,
    },
  });
}

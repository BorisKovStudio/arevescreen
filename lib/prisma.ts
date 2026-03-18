import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { normalizeDatabaseUrl } from '@/lib/database-url';

function getDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ?? process.env.PRISMA_DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL, PRISMA_DATABASE_URL, or POSTGRES_URL is not configured.');
  }

  return normalizeDatabaseUrl(databaseUrl);
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

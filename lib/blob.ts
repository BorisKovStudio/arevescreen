import { del, put } from '@vercel/blob';

const HERO_SLIDES_PREFIX = 'hero-slides';
const HERO_SLIDE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_HERO_SLIDE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

function normalizeFilename(filename: string) {
  const trimmed = filename.trim().toLowerCase();
  const safe = trimmed.replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-');
  return safe.replace(/^-|-$/g, '') || 'slide-image';
}

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function validateHeroSlideFile(file: File) {
  if (!file || file.size === 0) {
    return 'Choose an image file to upload.';
  }

  if (!ALLOWED_HERO_SLIDE_TYPES.has(file.type)) {
    return 'Hero slides must be JPG, PNG, WebP, or AVIF.';
  }

  if (file.size > HERO_SLIDE_MAX_BYTES) {
    return 'Hero slide image must be 10 MB or smaller.';
  }

  return null;
}

export async function uploadHeroSlideToBlob(file: File) {
  const validationError = validateHeroSlideFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (!isBlobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
  }

  const normalizedFilename = normalizeFilename(file.name);

  return put(`${HERO_SLIDES_PREFIX}/${normalizedFilename}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
}

export async function deleteBlobIfPresent(urlOrPathname: string | null | undefined) {
  if (!urlOrPathname || !isBlobConfigured()) {
    return;
  }

  await del(urlOrPathname);
}

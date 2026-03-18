import { del, put } from '@vercel/blob';

const HERO_SLIDES_PREFIX = 'hero-slides';
const FABRIC_OPTIONS_PREFIX = 'fabric-options';
const PROJECTS_PREFIX = 'projects';
const MANAGED_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
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

function validateManagedImageFile(file: File, subject: string) {
  if (!file || file.size === 0) {
    return `Choose an image file for the ${subject}.`;
  }

  if (!ALLOWED_HERO_SLIDE_TYPES.has(file.type)) {
    return `${subject} images must be JPG, PNG, WebP, or AVIF.`;
  }

  if (file.size > MANAGED_IMAGE_MAX_BYTES) {
    return `${subject} image must be 10 MB or smaller.`;
  }

  return null;
}

async function uploadImageToBlob(pathPrefix: string, file: File) {
  if (!isBlobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
  }

  const normalizedFilename = normalizeFilename(file.name);

  return put(`${pathPrefix}/${normalizedFilename}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
}

export function validateHeroSlideFile(file: File) {
  return validateManagedImageFile(file, 'hero slide');
}

export function validateFabricOptionFile(file: File) {
  return validateManagedImageFile(file, 'fabric option');
}

export function validateProjectImageFile(file: File) {
  return validateManagedImageFile(file, 'project');
}

export async function uploadHeroSlideToBlob(file: File) {
  const validationError = validateHeroSlideFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  return uploadImageToBlob(HERO_SLIDES_PREFIX, file);
}

export async function uploadFabricOptionToBlob(file: File) {
  const validationError = validateFabricOptionFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  return uploadImageToBlob(FABRIC_OPTIONS_PREFIX, file);
}

export async function uploadProjectImageToBlob(file: File) {
  const validationError = validateProjectImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  return uploadImageToBlob(PROJECTS_PREFIX, file);
}

export async function deleteBlobIfPresent(urlOrPathname: string | null | undefined) {
  if (!urlOrPathname || !isBlobConfigured()) {
    return;
  }

  await del(urlOrPathname);
}

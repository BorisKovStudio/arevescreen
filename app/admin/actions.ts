'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  clearSession,
  createSession,
  ensureBootstrapAdmin,
  formatEmail,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';
import { deleteBlobIfPresent, isBlobConfigured, uploadHeroSlideToBlob, validateHeroSlideFile } from '@/lib/blob';
import { HERO_SLIDES_CACHE_TAG } from '@/lib/hero-slides';
import { prisma } from '@/lib/prisma';

function redirectWithMessage(pathname: string, type: 'error' | 'success', message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${pathname}?${params.toString()}`);
}

function redirectToAdminLogin(type: 'error' | 'success', message: string): never {
  redirectWithMessage('/admin', type, message);
}

async function requireAdminUser() {
  const currentUser = await getSessionUser();

  if (!currentUser?.isAdmin) {
    redirectToAdminLogin('error', 'Sign in as an administrator to continue.');
  }

  return currentUser;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function parseSortOrder(value: FormDataEntryValue | null, fallback: number) {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

export async function signInAdminAction(formData: FormData) {
  await ensureBootstrapAdmin();

  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    redirectToAdminLogin('error', 'Enter your email and password.');
  }

  const user = await prisma.user.findUnique({
    where: { email: formatEmail(email) },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirectToAdminLogin('error', 'Incorrect email or password.');
  }

  if (!user.isAdmin) {
    redirectToAdminLogin('error', 'This user does not have admin access.');
  }

  await createSession(user.id);
  redirect('/admin/users?success=You+are+signed+in.');
}

export async function signOutAdminAction() {
  await clearSession();
  redirect('/admin');
}

export async function createUserAction(formData: FormData) {
  await requireAdminUser();

  const email = formData.get('email');
  const password = formData.get('password');
  const isAdmin = formData.get('isAdmin') === 'on';

  if (typeof email !== 'string' || typeof password !== 'string') {
    redirectWithMessage('/admin/users', 'error', 'Enter email and password for the new user.');
  }

  const normalizedEmail = formatEmail(email);

  if (normalizedEmail.length < 5 || !normalizedEmail.includes('@')) {
    redirectWithMessage('/admin/users', 'error', 'Enter a valid email address.');
  }

  if (password.trim().length < 8) {
    redirectWithMessage('/admin/users', 'error', 'Password must be at least 8 characters long.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    redirectWithMessage('/admin/users', 'error', 'A user with this email already exists.');
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      isAdmin,
      passwordHash: await hashPassword(password.trim()),
    },
  });

  revalidatePath('/admin/users');
  redirect('/admin/users?success=User+created.');
}

export async function toggleAdminStatusAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = formData.get('userId');

  if (typeof userId !== 'string' || !userId) {
    redirectWithMessage('/admin/users', 'error', 'Missing user to update.');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isAdmin: true,
      email: true,
    },
  });

  if (!targetUser) {
    redirectWithMessage('/admin/users', 'error', 'User not found.');
  }

  if (targetUser.isAdmin) {
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    });

    if (adminCount <= 1) {
      redirectWithMessage('/admin/users', 'error', 'At least one admin must remain on the project.');
    }
  }

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { isAdmin: !targetUser.isAdmin },
  });

  if (currentUser.id === targetUser.id && targetUser.isAdmin) {
    await clearSession();
    redirect('/admin?success=Your+admin+status+was+removed.+Sign+in+with+another+admin.');
  }

  revalidatePath('/admin/users');
  redirect(`/admin/users?success=${encodeURIComponent(`Updated ${targetUser.email}.`)}`);
}

export async function createHeroSlideAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/slides', 'error', 'Set BLOB_READ_WRITE_TOKEN before uploading hero slides.');
  }

  const image = formData.get('image');

  if (!(image instanceof File) || image.size === 0) {
    redirectWithMessage('/admin/slides', 'error', 'Choose an image file for the hero slide.');
  }

  const validationError = validateHeroSlideFile(image);

  if (validationError) {
    redirectWithMessage('/admin/slides', 'error', validationError);
  }

  const defaultOrder = await prisma.heroSlide.count();
  const sortOrder = parseSortOrder(formData.get('sortOrder'), defaultOrder);

  try {
    const blob = await uploadHeroSlideToBlob(image);

    await prisma.heroSlide.create({
      data: {
        imageUrl: blob.url,
        blobPathname: blob.pathname,
        sortOrder,
      },
    });
  } catch (error) {
    redirectWithMessage('/admin/slides', 'error', getErrorMessage(error, 'Unable to upload the hero slide.'));
  }

  revalidateTag(HERO_SLIDES_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/slides');
  redirect('/admin/slides?success=Hero+slide+uploaded.');
}

export async function moveHeroSlideAction(formData: FormData) {
  await requireAdminUser();

  const slideId = formData.get('slideId');
  const direction = formData.get('direction');

  if (typeof slideId !== 'string' || !slideId) {
    redirectWithMessage('/admin/slides', 'error', 'Missing hero slide to move.');
  }

  if (direction !== 'up' && direction !== 'down') {
    redirectWithMessage('/admin/slides', 'error', 'Invalid hero slide move request.');
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
    },
  });

  const currentIndex = slides.findIndex((slide) => slide.id === slideId);

  if (currentIndex === -1) {
    redirectWithMessage('/admin/slides', 'error', 'Hero slide not found.');
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= slides.length) {
    redirect('/admin/slides');
  }

  const reorderedSlides = slides.slice();
  [reorderedSlides[currentIndex], reorderedSlides[nextIndex]] = [
    reorderedSlides[nextIndex],
    reorderedSlides[currentIndex],
  ];

  try {
    await prisma.$transaction(
      reorderedSlides.map((slide, index) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );
  } catch {
    redirectWithMessage('/admin/slides', 'error', 'Unable to update hero slide order.');
  }

  revalidateTag(HERO_SLIDES_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/slides');
  redirect('/admin/slides?success=Slide+order+updated.');
}

export async function updateHeroSlideAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/slides', 'error', 'Set BLOB_READ_WRITE_TOKEN before updating hero slides.');
  }

  const slideId = formData.get('slideId');

  if (typeof slideId !== 'string' || !slideId) {
    redirectWithMessage('/admin/slides', 'error', 'Missing hero slide to update.');
  }

  const slide = await prisma.heroSlide.findUnique({
    where: { id: slideId },
    select: {
      id: true,
      imageUrl: true,
      blobPathname: true,
      sortOrder: true,
    },
  });

  if (!slide) {
    redirectWithMessage('/admin/slides', 'error', 'Hero slide not found.');
  }

  const image = formData.get('image');
  const hasReplacementImage = image instanceof File && image.size > 0;

  if (!hasReplacementImage) {
    redirectWithMessage('/admin/slides', 'error', 'Choose a new image before updating the slide.');
  }

  let nextImageUrl = slide.imageUrl;
  let nextBlobPathname = slide.blobPathname;

  if (hasReplacementImage) {
    const validationError = validateHeroSlideFile(image);

    if (validationError) {
      redirectWithMessage('/admin/slides', 'error', validationError);
    }

    try {
      const blob = await uploadHeroSlideToBlob(image);
      nextImageUrl = blob.url;
      nextBlobPathname = blob.pathname;
    } catch (error) {
      redirectWithMessage('/admin/slides', 'error', getErrorMessage(error, 'Unable to replace the hero slide.'));
    }
  }

  await prisma.heroSlide.update({
    where: { id: slide.id },
    data: {
      imageUrl: nextImageUrl,
      blobPathname: nextBlobPathname,
    },
  });

  if (hasReplacementImage && slide.blobPathname !== nextBlobPathname) {
    try {
      await deleteBlobIfPresent(slide.blobPathname);
    } catch {}
  }

  revalidateTag(HERO_SLIDES_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/slides');
  redirect('/admin/slides?success=Hero+slide+image+updated.');
}

export async function deleteHeroSlideAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/slides', 'error', 'Set BLOB_READ_WRITE_TOKEN before deleting hero slides.');
  }

  const slideId = formData.get('slideId');

  if (typeof slideId !== 'string' || !slideId) {
    redirectWithMessage('/admin/slides', 'error', 'Missing hero slide to delete.');
  }

  const slide = await prisma.heroSlide.findUnique({
    where: { id: slideId },
    select: {
      id: true,
      blobPathname: true,
    },
  });

  if (!slide) {
    redirectWithMessage('/admin/slides', 'error', 'Hero slide not found.');
  }

  await prisma.heroSlide.delete({
    where: { id: slide.id },
  });

  try {
    await deleteBlobIfPresent(slide.blobPathname);
  } catch {}

  revalidateTag(HERO_SLIDES_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/slides');
  redirect('/admin/slides?success=Hero+slide+deleted.');
}

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
import {
  deleteBlobIfPresent,
  isBlobConfigured,
  uploadFabricOptionToBlob,
  uploadHeroSlideToBlob,
  uploadProjectImageToBlob,
  validateFabricOptionFile,
  validateHeroSlideFile,
  validateProjectImageFile,
} from '@/lib/blob';
import { CALC_CACHE_TAG } from '@/lib/calc';
import { FABRIC_OPTIONS_CACHE_TAG } from '@/lib/fabric-options';
import {
  FAQS_CACHE_TAG,
  FAQS_MAX_COUNT,
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_QUESTION_MAX_LENGTH,
} from '@/lib/faqs';
import { HERO_SLIDES_CACHE_TAG } from '@/lib/hero-slides';
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECTS_CACHE_TAG,
  PROJECTS_MAX_COUNT,
  PROJECT_TITLE_MAX_LENGTH,
} from '@/lib/projects';
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

function getTrimmedFormValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateProjectFields(title: string, description: string) {
  if (!title) {
    return 'Enter a title for the project.';
  }

  if (title.length > PROJECT_TITLE_MAX_LENGTH) {
    return `Project title must be ${PROJECT_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (!description) {
    return 'Enter a description for the project.';
  }

  if (description.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
    return `Project description must be ${PROJECT_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

function validateFaqFields(question: string, answer: string) {
  if (!question) {
    return 'Enter a question for the FAQ item.';
  }

  if (question.length > FAQ_QUESTION_MAX_LENGTH) {
    return `FAQ question must be ${FAQ_QUESTION_MAX_LENGTH} characters or fewer.`;
  }

  if (!answer) {
    return 'Enter an answer for the FAQ item.';
  }

  if (answer.length > FAQ_ANSWER_MAX_LENGTH) {
    return `FAQ answer must be ${FAQ_ANSWER_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

type IntegerFieldResult = { value: number } | { error: string };
type CalcTierValidationResult =
  | {
      minSqft: number;
      maxSqft: number;
      pricePerSqft: number;
    }
  | {
      error: string;
    };

function parsePositiveIntegerField(value: FormDataEntryValue | null, label: string): IntegerFieldResult {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    return { error: `${label} must be a whole number.` };
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { error: `${label} must be greater than 0.` };
  }

  return { value: parsed };
}

function validateCalcTierFields(formData: FormData): CalcTierValidationResult {
  const minSqftResult = parsePositiveIntegerField(formData.get('minSqft'), 'Min sqft');
  if ('error' in minSqftResult) {
    return { error: minSqftResult.error };
  }

  const maxSqftResult = parsePositiveIntegerField(formData.get('maxSqft'), 'Max sqft');
  if ('error' in maxSqftResult) {
    return { error: maxSqftResult.error };
  }

  const pricePerSqftResult = parsePositiveIntegerField(formData.get('pricePerSqft'), 'Price');
  if ('error' in pricePerSqftResult) {
    return { error: pricePerSqftResult.error };
  }

  if (minSqftResult.value >= maxSqftResult.value) {
    return {
      error: 'Max sqft must be greater than min sqft. The max value starts the next period.',
    };
  }

  return {
    minSqft: minSqftResult.value,
    maxSqft: maxSqftResult.value,
    pricePerSqft: pricePerSqftResult.value,
  };
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

export async function createCalcTierAction(formData: FormData) {
  await requireAdminUser();

  const validationResult = validateCalcTierFields(formData);
  if ('error' in validationResult) {
    redirectWithMessage('/admin/calc', 'error', validationResult.error);
  }

  await prisma.calcTier.create({
    data: validationResult,
  });

  revalidateTag(CALC_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/calc');
  redirect('/admin/calc?success=Calc+period+created.');
}

export async function createFabricOptionAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/fabrics', 'error', 'Set BLOB_READ_WRITE_TOKEN before uploading fabric options.');
  }

  const label = getTrimmedFormValue(formData.get('label'));
  const image = formData.get('image');

  if (!label) {
    redirectWithMessage('/admin/fabrics', 'error', 'Enter a label for the fabric option.');
  }

  if (!(image instanceof File) || image.size === 0) {
    redirectWithMessage('/admin/fabrics', 'error', 'Choose an image file for the fabric option.');
  }

  const validationError = validateFabricOptionFile(image);

  if (validationError) {
    redirectWithMessage('/admin/fabrics', 'error', validationError);
  }

  const defaultOrder = await prisma.fabricOption.count();

  try {
    const blob = await uploadFabricOptionToBlob(image);

    await prisma.fabricOption.create({
      data: {
        label,
        imageUrl: blob.url,
        blobPathname: blob.pathname,
        sortOrder: defaultOrder,
      },
    });
  } catch (error) {
    redirectWithMessage('/admin/fabrics', 'error', getErrorMessage(error, 'Unable to upload the fabric option.'));
  }

  revalidateTag(FABRIC_OPTIONS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/fabrics');
  redirect('/admin/fabrics?success=Fabric+option+uploaded.');
}

export async function createProjectAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/projects', 'error', 'Set BLOB_READ_WRITE_TOKEN before uploading projects.');
  }

  const title = getTrimmedFormValue(formData.get('title'));
  const description = getTrimmedFormValue(formData.get('description'));
  const image = formData.get('image');
  const validationError = validateProjectFields(title, description);

  if (validationError) {
    redirectWithMessage('/admin/projects', 'error', validationError);
  }

  if (!(image instanceof File) || image.size === 0) {
    redirectWithMessage('/admin/projects', 'error', 'Choose an image file for the project.');
  }

  const imageValidationError = validateProjectImageFile(image);

  if (imageValidationError) {
    redirectWithMessage('/admin/projects', 'error', imageValidationError);
  }

  const existingProjectCount = await prisma.project.count();

  if (existingProjectCount >= PROJECTS_MAX_COUNT) {
    redirectWithMessage(
      '/admin/projects',
      'error',
      `Project limit reached. You can keep up to ${PROJECTS_MAX_COUNT} projects.`,
    );
  }

  try {
    const blob = await uploadProjectImageToBlob(image);

    await prisma.project.create({
      data: {
        title,
        description,
        coverImageUrl: blob.url,
        coverBlobPathname: blob.pathname,
        sortOrder: existingProjectCount,
      },
    });
  } catch (error) {
    redirectWithMessage('/admin/projects', 'error', getErrorMessage(error, 'Unable to upload the project.'));
  }

  revalidateTag(PROJECTS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirect('/admin/projects?success=Project+uploaded.');
}

export async function createFaqEntryAction(formData: FormData) {
  await requireAdminUser();

  const question = getTrimmedFormValue(formData.get('question'));
  const answer = getTrimmedFormValue(formData.get('answer'));
  const validationError = validateFaqFields(question, answer);

  if (validationError) {
    redirectWithMessage('/admin/faqs', 'error', validationError);
  }

  const existingFaqCount = await prisma.faqEntry.count();

  if (existingFaqCount >= FAQS_MAX_COUNT) {
    redirectWithMessage('/admin/faqs', 'error', `FAQ limit reached. You can keep up to ${FAQS_MAX_COUNT} items.`);
  }

  await prisma.faqEntry.create({
    data: {
      question,
      answer,
      sortOrder: existingFaqCount,
    },
  });

  revalidateTag(FAQS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/faqs');
  redirect('/admin/faqs?success=FAQ+item+created.');
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

export async function moveFabricOptionAction(formData: FormData) {
  await requireAdminUser();

  const optionId = formData.get('optionId');
  const direction = formData.get('direction');

  if (typeof optionId !== 'string' || !optionId) {
    redirectWithMessage('/admin/fabrics', 'error', 'Missing fabric option to move.');
  }

  if (direction !== 'up' && direction !== 'down') {
    redirectWithMessage('/admin/fabrics', 'error', 'Invalid fabric option move request.');
  }

  const options = await prisma.fabricOption.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
    },
  });

  const currentIndex = options.findIndex((option) => option.id === optionId);

  if (currentIndex === -1) {
    redirectWithMessage('/admin/fabrics', 'error', 'Fabric option not found.');
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= options.length) {
    redirect('/admin/fabrics');
  }

  const reorderedOptions = options.slice();
  [reorderedOptions[currentIndex], reorderedOptions[nextIndex]] = [
    reorderedOptions[nextIndex],
    reorderedOptions[currentIndex],
  ];

  try {
    await prisma.$transaction(
      reorderedOptions.map((option, index) =>
        prisma.fabricOption.update({
          where: { id: option.id },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );
  } catch {
    redirectWithMessage('/admin/fabrics', 'error', 'Unable to update fabric option order.');
  }

  revalidateTag(FABRIC_OPTIONS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/fabrics');
  redirect('/admin/fabrics?success=Fabric+order+updated.');
}

export async function moveProjectAction(formData: FormData) {
  await requireAdminUser();

  const projectId = formData.get('projectId');
  const direction = formData.get('direction');

  if (typeof projectId !== 'string' || !projectId) {
    redirectWithMessage('/admin/projects', 'error', 'Missing project to move.');
  }

  if (direction !== 'up' && direction !== 'down') {
    redirectWithMessage('/admin/projects', 'error', 'Invalid project move request.');
  }

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
    },
  });

  const currentIndex = projects.findIndex((project) => project.id === projectId);

  if (currentIndex === -1) {
    redirectWithMessage('/admin/projects', 'error', 'Project not found.');
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= projects.length) {
    redirect('/admin/projects');
  }

  const reorderedProjects = projects.slice();
  [reorderedProjects[currentIndex], reorderedProjects[nextIndex]] = [
    reorderedProjects[nextIndex],
    reorderedProjects[currentIndex],
  ];

  try {
    await prisma.$transaction(
      reorderedProjects.map((project, index) =>
        prisma.project.update({
          where: { id: project.id },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );
  } catch {
    redirectWithMessage('/admin/projects', 'error', 'Unable to update project order.');
  }

  revalidateTag(PROJECTS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirect('/admin/projects?success=Project+order+updated.');
}

export async function moveFaqEntryAction(formData: FormData) {
  await requireAdminUser();

  const faqId = formData.get('faqId');
  const direction = formData.get('direction');

  if (typeof faqId !== 'string' || !faqId) {
    redirectWithMessage('/admin/faqs', 'error', 'Missing FAQ item to move.');
  }

  if (direction !== 'up' && direction !== 'down') {
    redirectWithMessage('/admin/faqs', 'error', 'Invalid FAQ move request.');
  }

  const faqEntries = await prisma.faqEntry.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
    },
  });

  const currentIndex = faqEntries.findIndex((entry) => entry.id === faqId);

  if (currentIndex === -1) {
    redirectWithMessage('/admin/faqs', 'error', 'FAQ item not found.');
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= faqEntries.length) {
    redirect('/admin/faqs');
  }

  const reorderedFaqEntries = faqEntries.slice();
  [reorderedFaqEntries[currentIndex], reorderedFaqEntries[nextIndex]] = [
    reorderedFaqEntries[nextIndex],
    reorderedFaqEntries[currentIndex],
  ];

  try {
    await prisma.$transaction(
      reorderedFaqEntries.map((entry, index) =>
        prisma.faqEntry.update({
          where: { id: entry.id },
          data: {
            sortOrder: index,
          },
        }),
      ),
    );
  } catch {
    redirectWithMessage('/admin/faqs', 'error', 'Unable to update FAQ order.');
  }

  revalidateTag(FAQS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/faqs');
  redirect('/admin/faqs?success=FAQ+order+updated.');
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

export async function updateCalcTierAction(formData: FormData) {
  await requireAdminUser();

  const tierId = formData.get('tierId');

  if (typeof tierId !== 'string' || !tierId) {
    redirectWithMessage('/admin/calc', 'error', 'Missing calc period to update.');
  }

  const calcTier = await prisma.calcTier.findUnique({
    where: { id: tierId },
    select: { id: true },
  });

  if (!calcTier) {
    redirectWithMessage('/admin/calc', 'error', 'Calc period not found.');
  }

  const validationResult = validateCalcTierFields(formData);
  if ('error' in validationResult) {
    redirectWithMessage('/admin/calc', 'error', validationResult.error);
  }

  await prisma.calcTier.update({
    where: { id: calcTier.id },
    data: validationResult,
  });

  revalidateTag(CALC_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/calc');
  redirect('/admin/calc?success=Calc+period+updated.');
}

export async function updateFabricOptionAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/fabrics', 'error', 'Set BLOB_READ_WRITE_TOKEN before updating fabric options.');
  }

  const optionId = formData.get('optionId');

  if (typeof optionId !== 'string' || !optionId) {
    redirectWithMessage('/admin/fabrics', 'error', 'Missing fabric option to update.');
  }

  const option = await prisma.fabricOption.findUnique({
    where: { id: optionId },
    select: {
      id: true,
      label: true,
      imageUrl: true,
      blobPathname: true,
    },
  });

  if (!option) {
    redirectWithMessage('/admin/fabrics', 'error', 'Fabric option not found.');
  }

  const label = getTrimmedFormValue(formData.get('label'));

  if (!label) {
    redirectWithMessage('/admin/fabrics', 'error', 'Enter a label for the fabric option.');
  }

  const image = formData.get('image');
  const hasReplacementImage = image instanceof File && image.size > 0;

  let nextImageUrl = option.imageUrl;
  let nextBlobPathname = option.blobPathname;

  if (hasReplacementImage) {
    const validationError = validateFabricOptionFile(image);

    if (validationError) {
      redirectWithMessage('/admin/fabrics', 'error', validationError);
    }

    try {
      const blob = await uploadFabricOptionToBlob(image);
      nextImageUrl = blob.url;
      nextBlobPathname = blob.pathname;
    } catch (error) {
      redirectWithMessage('/admin/fabrics', 'error', getErrorMessage(error, 'Unable to replace the fabric option image.'));
    }
  }

  await prisma.fabricOption.update({
    where: { id: option.id },
    data: {
      label,
      imageUrl: nextImageUrl,
      blobPathname: nextBlobPathname,
    },
  });

  if (hasReplacementImage && option.blobPathname !== nextBlobPathname) {
    try {
      await deleteBlobIfPresent(option.blobPathname);
    } catch {}
  }

  revalidateTag(FABRIC_OPTIONS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/fabrics');
  redirect('/admin/fabrics?success=Fabric+option+updated.');
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminUser();

  const projectId = formData.get('projectId');

  if (typeof projectId !== 'string' || !projectId) {
    redirectWithMessage('/admin/projects', 'error', 'Missing project to update.');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      coverImageUrl: true,
      coverBlobPathname: true,
    },
  });

  if (!project) {
    redirectWithMessage('/admin/projects', 'error', 'Project not found.');
  }

  const title = getTrimmedFormValue(formData.get('title'));
  const description = getTrimmedFormValue(formData.get('description'));
  const validationError = validateProjectFields(title, description);

  if (validationError) {
    redirectWithMessage('/admin/projects', 'error', validationError);
  }

  const image = formData.get('image');
  const hasReplacementImage = image instanceof File && image.size > 0;

  let nextCoverImageUrl = project.coverImageUrl;
  let nextCoverBlobPathname = project.coverBlobPathname;

  if (hasReplacementImage) {
    if (!isBlobConfigured()) {
      redirectWithMessage('/admin/projects', 'error', 'Set BLOB_READ_WRITE_TOKEN before updating project images.');
    }

    const imageValidationError = validateProjectImageFile(image);

    if (imageValidationError) {
      redirectWithMessage('/admin/projects', 'error', imageValidationError);
    }

    try {
      const blob = await uploadProjectImageToBlob(image);
      nextCoverImageUrl = blob.url;
      nextCoverBlobPathname = blob.pathname;
    } catch (error) {
      redirectWithMessage('/admin/projects', 'error', getErrorMessage(error, 'Unable to replace the project image.'));
    }
  }

  await prisma.project.update({
    where: { id: project.id },
    data: {
      title,
      description,
      coverImageUrl: nextCoverImageUrl,
      coverBlobPathname: nextCoverBlobPathname,
    },
  });

  if (hasReplacementImage && project.coverBlobPathname !== nextCoverBlobPathname) {
    try {
      await deleteBlobIfPresent(project.coverBlobPathname);
    } catch {}
  }

  revalidateTag(PROJECTS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirect('/admin/projects?success=Project+updated.');
}

export async function updateFaqEntryAction(formData: FormData) {
  await requireAdminUser();

  const faqId = formData.get('faqId');

  if (typeof faqId !== 'string' || !faqId) {
    redirectWithMessage('/admin/faqs', 'error', 'Missing FAQ item to update.');
  }

  const faqEntry = await prisma.faqEntry.findUnique({
    where: { id: faqId },
    select: {
      id: true,
    },
  });

  if (!faqEntry) {
    redirectWithMessage('/admin/faqs', 'error', 'FAQ item not found.');
  }

  const question = getTrimmedFormValue(formData.get('question'));
  const answer = getTrimmedFormValue(formData.get('answer'));
  const validationError = validateFaqFields(question, answer);

  if (validationError) {
    redirectWithMessage('/admin/faqs', 'error', validationError);
  }

  await prisma.faqEntry.update({
    where: { id: faqEntry.id },
    data: {
      question,
      answer,
    },
  });

  revalidateTag(FAQS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/faqs');
  redirect('/admin/faqs?success=FAQ+item+updated.');
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

export async function deleteCalcTierAction(formData: FormData) {
  await requireAdminUser();

  const tierId = formData.get('tierId');

  if (typeof tierId !== 'string' || !tierId) {
    redirectWithMessage('/admin/calc', 'error', 'Missing calc period to delete.');
  }

  const calcTier = await prisma.calcTier.findUnique({
    where: { id: tierId },
    select: { id: true },
  });

  if (!calcTier) {
    redirectWithMessage('/admin/calc', 'error', 'Calc period not found.');
  }

  await prisma.calcTier.delete({
    where: { id: calcTier.id },
  });

  revalidateTag(CALC_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/calc');
  redirect('/admin/calc?success=Calc+period+deleted.');
}

export async function deleteFabricOptionAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/fabrics', 'error', 'Set BLOB_READ_WRITE_TOKEN before deleting fabric options.');
  }

  const optionId = formData.get('optionId');

  if (typeof optionId !== 'string' || !optionId) {
    redirectWithMessage('/admin/fabrics', 'error', 'Missing fabric option to delete.');
  }

  const option = await prisma.fabricOption.findUnique({
    where: { id: optionId },
    select: {
      id: true,
      blobPathname: true,
    },
  });

  if (!option) {
    redirectWithMessage('/admin/fabrics', 'error', 'Fabric option not found.');
  }

  await prisma.fabricOption.delete({
    where: { id: option.id },
  });

  try {
    await deleteBlobIfPresent(option.blobPathname);
  } catch {}

  revalidateTag(FABRIC_OPTIONS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/fabrics');
  redirect('/admin/fabrics?success=Fabric+option+deleted.');
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdminUser();

  if (!isBlobConfigured()) {
    redirectWithMessage('/admin/projects', 'error', 'Set BLOB_READ_WRITE_TOKEN before deleting projects.');
  }

  const projectId = formData.get('projectId');

  if (typeof projectId !== 'string' || !projectId) {
    redirectWithMessage('/admin/projects', 'error', 'Missing project to delete.');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      coverBlobPathname: true,
      galleryBlobPathnames: true,
    },
  });

  if (!project) {
    redirectWithMessage('/admin/projects', 'error', 'Project not found.');
  }

  await prisma.project.delete({
    where: { id: project.id },
  });

  for (const blobPathname of [project.coverBlobPathname, ...project.galleryBlobPathnames]) {
    try {
      await deleteBlobIfPresent(blobPathname);
    } catch {}
  }

  revalidateTag(PROJECTS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/projects');
  redirect('/admin/projects?success=Project+deleted.');
}

export async function deleteFaqEntryAction(formData: FormData) {
  await requireAdminUser();

  const faqId = formData.get('faqId');

  if (typeof faqId !== 'string' || !faqId) {
    redirectWithMessage('/admin/faqs', 'error', 'Missing FAQ item to delete.');
  }

  const faqEntry = await prisma.faqEntry.findUnique({
    where: { id: faqId },
    select: {
      id: true,
    },
  });

  if (!faqEntry) {
    redirectWithMessage('/admin/faqs', 'error', 'FAQ item not found.');
  }

  await prisma.faqEntry.delete({
    where: { id: faqEntry.id },
  });

  revalidateTag(FAQS_CACHE_TAG, 'max');
  revalidatePath('/');
  revalidatePath('/admin/faqs');
  redirect('/admin/faqs?success=FAQ+item+deleted.');
}

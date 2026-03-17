'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearSession, createSession, ensureBootstrapAdmin, formatEmail, getSessionUser, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function redirectWithMessage(type: 'error' | 'success', message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/admin?${params.toString()}`);
}

async function requireAdminUser() {
  const currentUser = await getSessionUser();

  if (!currentUser?.isAdmin) {
    redirectWithMessage('error', 'Sign in as an administrator to continue.');
  }

  return currentUser;
}

export async function signInAdminAction(formData: FormData) {
  await ensureBootstrapAdmin();

  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    redirectWithMessage('error', 'Enter your email and password.');
  }

  const user = await prisma.user.findUnique({
    where: { email: formatEmail(email) },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirectWithMessage('error', 'Incorrect email or password.');
  }

  if (!user.isAdmin) {
    redirectWithMessage('error', 'This user does not have admin access.');
  }

  await createSession(user.id);
  redirect('/admin?success=You+are+signed+in.');
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
    redirectWithMessage('error', 'Enter email and password for the new user.');
  }

  const normalizedEmail = formatEmail(email);

  if (normalizedEmail.length < 5 || !normalizedEmail.includes('@')) {
    redirectWithMessage('error', 'Enter a valid email address.');
  }

  if (password.trim().length < 8) {
    redirectWithMessage('error', 'Password must be at least 8 characters long.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    redirectWithMessage('error', 'A user with this email already exists.');
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      isAdmin,
      passwordHash: await hashPassword(password.trim()),
    },
  });

  revalidatePath('/admin');
  redirect('/admin?success=User+created.');
}

export async function toggleAdminStatusAction(formData: FormData) {
  const currentUser = await requireAdminUser();
  const userId = formData.get('userId');

  if (typeof userId !== 'string' || !userId) {
    redirectWithMessage('error', 'Missing user to update.');
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
    redirectWithMessage('error', 'User not found.');
  }

  if (targetUser.isAdmin) {
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    });

    if (adminCount <= 1) {
      redirectWithMessage('error', 'At least one admin must remain on the project.');
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

  revalidatePath('/admin');
  redirect(`/admin?success=${encodeURIComponent(`Updated ${targetUser.email}.`)}`);
}

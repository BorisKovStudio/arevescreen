import { redirect } from 'next/navigation';
import { ensureBootstrapAdmin, getSessionUser } from '@/lib/auth';

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export type AdminListUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
};

export function getMessage(params: Record<string, string | string[] | undefined>) {
  const error = params.error;
  const success = params.success;

  if (typeof error === 'string' && error) {
    return { tone: 'error' as const, text: error };
  }

  if (typeof success === 'string' && success) {
    return { tone: 'success' as const, text: success };
  }

  return null;
}

export function formatRole(user: { isAdmin: boolean }) {
  return user.isAdmin ? 'Admin' : 'Member';
}

export async function requireAdminPage() {
  await ensureBootstrapAdmin();

  const currentUser = await getSessionUser();

  if (!currentUser?.isAdmin) {
    redirect('/admin?error=Sign+in+as+an+administrator+to+continue.');
  }

  return currentUser;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { createUserAction, signInAdminAction, signOutAdminAction, toggleAdminStatusAction } from '@/app/admin/actions';
import { ensureBootstrapAdmin, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type AdminListUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
};

function getMessage(params: Record<string, string | string[] | undefined>) {
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

function formatRole(user: { isAdmin: boolean }) {
  return user.isAdmin ? 'Admin' : 'Member';
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await ensureBootstrapAdmin();

  const params = await searchParams;
  const currentUser = await getSessionUser();
  const message = getMessage(params);
  const adminCount = await prisma.user.count({
    where: { isAdmin: true },
  });
  const bootstrapConfigured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

  if (!currentUser?.isAdmin) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Areve Screen</p>
            <h1 className={styles.title}>Admin access</h1>
            <p className={styles.lead}>
              Secure area for managing admin users and future customer records.
            </p>
            <Link className={styles.homeLink} href="/">
              Back to site
            </Link>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>Sign in</p>
                <h2 className={styles.cardTitle}>Administrator login</h2>
              </div>
              <div className={styles.statusBlock}>
                <span className={styles.statusLabel}>Admins in database</span>
                <strong className={styles.statusValue}>{adminCount}</strong>
              </div>
            </div>

            {message ? (
              <p className={message.tone === 'error' ? styles.errorMessage : styles.successMessage}>
                {message.text}
              </p>
            ) : null}

            <form action={signInAdminAction} className={styles.form}>
              <label className={styles.field}>
                <span>Email</span>
                <input autoComplete="email" name="email" placeholder="admin@arevescreen.com" type="email" />
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <input autoComplete="current-password" name="password" placeholder="Enter password" type="password" />
              </label>

              <button className={styles.primaryButton} type="submit">
                Sign in
              </button>
            </form>

            <div className={styles.noteGrid}>
              <article className={styles.noteCard}>
                <h3>Bootstrap</h3>
                <p>
                  First admin is created automatically from <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code>.
                </p>
              </article>
              <article className={styles.noteCard}>
                <h3>Status</h3>
                <p>{bootstrapConfigured ? 'Bootstrap credentials are configured.' : 'Bootstrap credentials are missing.'}</p>
              </article>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const users: AdminListUser[] = await prisma.user.findMany({
    orderBy: [{ isAdmin: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Areve Screen</p>
          <h1 className={styles.title}>Admin dashboard</h1>
          <p className={styles.lead}>
            Manage login accounts for the cabinet and promote or demote administrators without leaving the site.
          </p>
        </section>

        <section className={styles.dashboard}>
          <header className={styles.toolbar}>
            <div>
              <p className={styles.cardEyebrow}>Signed in as</p>
              <h2 className={styles.cardTitle}>{currentUser.email}</h2>
            </div>
            <div className={styles.toolbarActions}>
              <Link className={styles.secondaryButton} href="/">
                View website
              </Link>
              <form action={signOutAdminAction}>
                <button className={styles.ghostButton} type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </header>

          {message ? (
            <p className={message.tone === 'error' ? styles.errorMessage : styles.successMessage}>
              {message.text}
            </p>
          ) : null}

          <div className={styles.grid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.cardEyebrow}>New account</p>
                  <h3 className={styles.panelTitle}>Create user</h3>
                </div>
                <span className={styles.counterPill}>{users.length} total</span>
              </div>

              <form action={createUserAction} className={styles.form}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input autoComplete="email" name="email" placeholder="user@arevescreen.com" type="email" />
                </label>

                <label className={styles.field}>
                  <span>Password</span>
                  <input autoComplete="new-password" name="password" placeholder="Minimum 8 characters" type="password" />
                </label>

                <label className={styles.checkField}>
                  <input name="isAdmin" type="checkbox" />
                  <span>Grant admin access immediately</span>
                </label>

                <button className={styles.primaryButton} type="submit">
                  Create account
                </button>
              </form>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.cardEyebrow}>User roles</p>
                  <h3 className={styles.panelTitle}>Manage admins</h3>
                </div>
                <span className={styles.counterPill}>{adminCount} admins</span>
              </div>

              <div className={styles.userList}>
                {users.map((user) => (
                  <article className={styles.userCard} key={user.id}>
                    <div className={styles.userInfo}>
                      <div className={styles.userHeading}>
                        <strong>{user.email}</strong>
                        <span className={user.isAdmin ? styles.roleAdmin : styles.roleMember}>{formatRole(user)}</span>
                      </div>
                      <p className={styles.userMeta}>
                        Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(user.createdAt)}
                      </p>
                    </div>

                    <form action={toggleAdminStatusAction}>
                      <input name="userId" type="hidden" value={user.id} />
                      <button className={styles.secondaryButton} type="submit">
                        {user.isAdmin ? 'Remove admin' : 'Make admin'}
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

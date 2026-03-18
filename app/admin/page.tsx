import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signInAdminAction } from '@/app/admin/actions';
import { type SearchParams, getMessage } from '@/app/admin/admin.utils';
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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await ensureBootstrapAdmin();

  const params = await searchParams;
  const currentUser = await getSessionUser();

  if (currentUser?.isAdmin) {
    redirect('/admin/users');
  }

  const message = getMessage(params);
  const adminCount = await prisma.user.count({
    where: { isAdmin: true },
  });
  const bootstrapConfigured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.pageHeader}>
          <div className={styles.headerMain}>
            <p className={styles.eyebrow}>Areve Screen</p>
            <h1 className={styles.headerTitle}>Admin access</h1>
            <p className={styles.headerLead}>Secure area for managing admin users and homepage slides.</p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.secondaryButton} href="/">
              Back to site
            </Link>
          </div>
        </header>

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
            <p className={message.tone === 'error' ? styles.errorMessage : styles.successMessage}>{message.text}</p>
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

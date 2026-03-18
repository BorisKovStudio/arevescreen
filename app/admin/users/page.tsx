import type { Metadata } from 'next';
import { AdminShell } from '@/app/admin/AdminShell';
import { createUserAction, toggleAdminStatusAction } from '@/app/admin/actions';
import { type AdminListUser, type SearchParams, formatRole, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Users | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const adminCount = await prisma.user.count({
    where: { isAdmin: true },
  });
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
      <AdminShell
        activeSection="users"
        currentUser={currentUser}
        description="Create accounts and manage administrator access."
        title="Users"
      >
        <section className={styles.dashboard}>
          {message ? (
            <p className={message.tone === 'error' ? styles.errorMessage : styles.successMessage}>
              {message.text}
            </p>
          ) : null}

          <div className={styles.grid}>
            <section className={`${styles.panel} ${styles.panelAnchor}`} id="new-account">
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
      </AdminShell>
    </main>
  );
}

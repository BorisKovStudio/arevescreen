import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOutAdminAction } from '@/app/admin/actions';
import styles from './page.module.css';

type AdminShellProps = {
  currentUser: {
    email: string;
  };
  activeSection: 'users' | 'slides' | 'fabrics' | 'projects';
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminShell({
  currentUser,
  activeSection,
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <header className={`${styles.pageHeader} ${styles.pageHeaderCompact}`}>
        <div className={styles.headerMain}>
          <p className={styles.eyebrow}>Areve Screen</p>
          <h1 className={styles.headerTitle}>{title}</h1>
          {description ? <p className={styles.headerLead}>{description}</p> : null}
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/">
            View website
          </Link>
          <span className={styles.loginBadge}>{currentUser.email}</span>
          <form action={signOutAdminAction} className={styles.headerActionForm}>
            <button className={styles.ghostButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <nav aria-label="Admin sections" className={styles.sectionMenu}>
        <Link
          className={`${styles.sectionMenuLink} ${
            activeSection === 'users' ? styles.sectionMenuLinkActive : ''
          }`}
          href="/admin/users"
        >
          Users
        </Link>
        <Link
          className={`${styles.sectionMenuLink} ${
            activeSection === 'slides' ? styles.sectionMenuLinkActive : ''
          }`}
          href="/admin/slides"
        >
          Slides
        </Link>
        <Link
          className={`${styles.sectionMenuLink} ${
            activeSection === 'fabrics' ? styles.sectionMenuLinkActive : ''
          }`}
          href="/admin/fabrics"
        >
          Fabrics
        </Link>
        <Link
          className={`${styles.sectionMenuLink} ${
            activeSection === 'projects' ? styles.sectionMenuLinkActive : ''
          }`}
          href="/admin/projects"
        >
          Projects
        </Link>
      </nav>

      {children}
    </div>
  );
}

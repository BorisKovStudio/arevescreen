'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SiteHeader.module.css';

type AdminSessionResponse = {
  isAdmin: boolean;
};

export function AdminHeaderLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as AdminSessionResponse;

        if (!cancelled) {
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        // Keep the admin link hidden if the session check fails.
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.leftSlot}>
      {isAdmin ? (
        <Link className={styles.adminLink} href="/admin">
          Admin
        </Link>
      ) : (
        <div className={styles.spacer} aria-hidden="true" />
      )}
    </div>
  );
}

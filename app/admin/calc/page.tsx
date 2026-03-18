import type { Metadata } from 'next';
import { AdminShell } from '@/app/admin/AdminShell';
import {
  createCalcTierAction,
  deleteCalcTierAction,
  updateCalcTierAction,
} from '@/app/admin/actions';
import { type SearchParams, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import { formatCalcRangeLabel, getAdminCalcTiers, getCalcCoverageIssues } from '@/lib/calc';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Calc | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCalcPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const calcTiers = await getAdminCalcTiers();
  const coverageIssues = getCalcCoverageIssues(calcTiers);

  return (
    <main className={styles.page}>
      <AdminShell
        activeSection="calc"
        currentUser={currentUser}
        description="Manage sqft price periods used for the quote estimate on the website."
        title="Calc"
      >
        <section className={styles.dashboard}>
          {message ? (
            <p className={message.tone === 'error' ? styles.errorMessage : styles.successMessage}>
              {message.text}
            </p>
          ) : null}

          <section className={`${styles.panel} ${styles.heroSlidesPanel}`}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.cardEyebrow}>Quote estimate</p>
                <h3 className={styles.panelTitle}>Calc periods</h3>
              </div>
              <span className={styles.counterPill}>{calcTiers.length} periods</span>
            </div>

            <p className={styles.helperText}>
              Define price periods by <code>sqft</code>. The website calculates total estimate as{' '}
              <code>length * width * price</code>. Only whole numbers are allowed in all calc fields.
              {' '}Max sqft is exclusive, so <code>2-4</code> is used as <code>2-3.9</code> and <code>4</code> starts the next period.
            </p>

            {coverageIssues.length > 0 ? (
              <div className={styles.warningMessage}>
                {coverageIssues.map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            ) : null}

            <form action={createCalcTierAction} className={`${styles.form} ${styles.calcCreateForm}`}>
              <label className={styles.field}>
                <span>Min sqft</span>
                <input inputMode="numeric" min="1" name="minSqft" pattern="[0-9]*" step="1" type="number" />
              </label>

              <label className={styles.field}>
                <span>Max sqft</span>
                <input inputMode="numeric" min="1" name="maxSqft" pattern="[0-9]*" step="1" type="number" />
              </label>

              <label className={styles.field}>
                <span>Price</span>
                <input inputMode="numeric" min="1" name="pricePerSqft" pattern="[0-9]*" step="1" type="number" />
              </label>

              <button className={styles.primaryButton} type="submit">
                Add period
              </button>
            </form>

            {calcTiers.length === 0 ? (
              <p className={styles.emptyState}>
                No calc periods yet. Add the first sqft range here, and the website will start showing estimate preview before
                the form is sent.
              </p>
            ) : (
              <div className={styles.calcTierList}>
                {calcTiers.map((tier, index) => (
                  <article className={styles.calcTierCard} key={tier.id}>
                    <div className={styles.calcTierHeader}>
                      <div>
                        <p className={styles.cardEyebrow}>Period {index + 1}</p>
                        <h4 className={styles.calcTierTitle}>
                          {formatCalcRangeLabel(tier.minSqft, tier.maxSqft)}
                        </h4>
                      </div>
                      <div className={styles.calcTierMeta}>
                        <span className={styles.counterPill}>${tier.pricePerSqft} / sqft</span>
                        <span className={styles.userMeta}>
                          Added {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(tier.createdAt)}
                        </span>
                      </div>
                    </div>

                    <form action={updateCalcTierAction} className={`${styles.form} ${styles.calcTierForm}`}>
                      <input name="tierId" type="hidden" value={tier.id} />

                      <label className={styles.field}>
                        <span>Min sqft</span>
                        <input
                          defaultValue={tier.minSqft}
                          inputMode="numeric"
                          min="1"
                          name="minSqft"
                          pattern="[0-9]*"
                          step="1"
                          type="number"
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Max sqft</span>
                        <input
                          defaultValue={tier.maxSqft}
                          inputMode="numeric"
                          min="1"
                          name="maxSqft"
                          pattern="[0-9]*"
                          step="1"
                          type="number"
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Price</span>
                        <input
                          defaultValue={tier.pricePerSqft}
                          inputMode="numeric"
                          min="1"
                          name="pricePerSqft"
                          pattern="[0-9]*"
                          step="1"
                          type="number"
                        />
                      </label>

                      <div className={styles.calcTierActions}>
                        <button className={styles.secondaryButton} type="submit">
                          Save period
                        </button>
                      </div>
                    </form>

                    <form action={deleteCalcTierAction} className={styles.calcTierDeleteForm}>
                      <input name="tierId" type="hidden" value={tier.id} />
                      <button className={styles.ghostButton} type="submit">
                        Delete period
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </AdminShell>
    </main>
  );
}

import type { Metadata } from 'next';
import { AdminShell } from '@/app/admin/AdminShell';
import {
  createFaqEntryAction,
  deleteFaqEntryAction,
  moveFaqEntryAction,
  updateFaqEntryAction,
} from '@/app/admin/actions';
import { type SearchParams, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import {
  FAQS_MAX_COUNT,
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_QUESTION_MAX_LENGTH,
  getAdminFaqEntries,
} from '@/lib/faqs';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin FAQ | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const faqEntries = await getAdminFaqEntries();
  const faqLimitReached = faqEntries.length >= FAQS_MAX_COUNT;
  const faqLimitMessage = `FAQ limit reached. Maximum ${FAQS_MAX_COUNT} items. Delete one FAQ item to add another.`;

  return (
    <main className={styles.page}>
      <AdminShell
        activeSection="faqs"
        currentUser={currentUser}
        description="Manage FAQ copy without changing the homepage layout."
        title="FAQ"
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
                <p className={styles.cardEyebrow}>Homepage copy</p>
                <h3 className={styles.panelTitle}>FAQ items</h3>
              </div>
              <span className={styles.counterPill}>{faqEntries.length} custom</span>
            </div>

            <p className={styles.helperText}>
              Manage FAQ questions and answers from admin. Questions are limited to {FAQ_QUESTION_MAX_LENGTH} characters and
              answers to {FAQ_ANSWER_MAX_LENGTH} characters to preserve the accordion layout. You can keep up to{' '}
              {FAQS_MAX_COUNT} FAQ items.
            </p>

            <div
              aria-disabled={faqLimitReached}
              className={`${faqLimitReached ? styles.uploadLimitWrapper : ''} ${
                faqLimitReached ? styles.uploadLimitDisabled : ''
              }`.trim()}
            >
              <form action={createFaqEntryAction} className={`${styles.form} ${styles.faqCreateForm}`}>
                <div className={styles.faqCreateTopRow}>
                  <label className={styles.field}>
                    <span>Question</span>
                    <input
                      defaultValue={`Question ${String(faqEntries.length + 1).padStart(2, '0')}`}
                      disabled={faqLimitReached}
                      maxLength={FAQ_QUESTION_MAX_LENGTH}
                      name="question"
                      type="text"
                    />
                  </label>

                  <button className={styles.primaryButton} disabled={faqLimitReached} type="submit">
                    Add FAQ item
                  </button>
                </div>

                <label className={`${styles.field} ${styles.faqAnswerField}`}>
                  <span>Answer</span>
                  <textarea
                    className={styles.faqTextarea}
                    disabled={faqLimitReached}
                    maxLength={FAQ_ANSWER_MAX_LENGTH}
                    name="answer"
                    rows={3}
                  />
                </label>
              </form>

              {faqLimitReached ? (
                <>
                  <button
                    aria-describedby="faq-limit-tooltip"
                    aria-label={faqLimitMessage}
                    className={styles.uploadLimitOverlay}
                    title={faqLimitMessage}
                    type="button"
                  />
                  <div className={styles.uploadLimitTooltip} id="faq-limit-tooltip" role="status">
                    FAQ limit reached. Maximum {FAQS_MAX_COUNT} items. Delete one FAQ item to add another.
                  </div>
                </>
              ) : null}
            </div>

            {faqEntries.length === 0 ? (
              <p className={styles.emptyState}>
                No custom FAQ items yet. Create the first one here, and the homepage will switch from static content to
                database content.
              </p>
            ) : (
              <div className={styles.textItemsList}>
                {faqEntries.map((entry, index) => (
                  <article className={styles.textItemCard} key={entry.id}>
                    <div className={styles.textItemHeader}>
                      <div>
                        <p className={styles.cardEyebrow}>FAQ {index + 1}</p>
                        <h4 className={styles.faqQuestionTitle}>{entry.question}</h4>
                      </div>
                      <div className={styles.faqMetaRow}>
                        <span className={styles.counterPill}>Position {index + 1}</span>
                        <span className={styles.userMeta}>
                          Added {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(entry.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.faqItemControls}>
                      <div className={styles.faqMoveActions}>
                        <form action={moveFaqEntryAction}>
                          <input name="faqId" type="hidden" value={entry.id} />
                          <input name="direction" type="hidden" value="up" />
                          <button className={styles.secondaryButton} disabled={index === 0} type="submit">
                            Move up
                          </button>
                        </form>

                        <form action={moveFaqEntryAction}>
                          <input name="faqId" type="hidden" value={entry.id} />
                          <input name="direction" type="hidden" value="down" />
                          <button className={styles.secondaryButton} disabled={index === faqEntries.length - 1} type="submit">
                            Move down
                          </button>
                        </form>
                      </div>

                      <form action={deleteFaqEntryAction} className={styles.faqDeleteForm}>
                        <input name="faqId" type="hidden" value={entry.id} />
                        <button className={styles.ghostButton} type="submit">
                          Delete FAQ
                        </button>
                      </form>
                    </div>

                    <form action={updateFaqEntryAction} className={`${styles.form} ${styles.textItemForm}`}>
                      <input name="faqId" type="hidden" value={entry.id} />

                      <div className={styles.faqEditTopRow}>
                        <label className={styles.field}>
                          <span>Question</span>
                          <input
                            defaultValue={entry.question}
                            maxLength={FAQ_QUESTION_MAX_LENGTH}
                            name="question"
                            type="text"
                          />
                        </label>

                        <div className={styles.faqSaveAction}>
                          <button className={styles.secondaryButton} type="submit">
                            Save FAQ
                          </button>
                        </div>
                      </div>

                      <details className={styles.faqAnswerDetails}>
                        <summary className={styles.faqAnswerSummary}>Answer</summary>

                        <label className={`${styles.field} ${styles.faqAnswerField}`}>
                          <textarea
                            className={styles.faqTextarea}
                            defaultValue={entry.answer}
                            maxLength={FAQ_ANSWER_MAX_LENGTH}
                            name="answer"
                            rows={3}
                          />
                        </label>
                      </details>
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

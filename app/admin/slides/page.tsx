import type { Metadata } from 'next';
import Image from 'next/image';
import { AdminShell } from '@/app/admin/AdminShell';
import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  moveHeroSlideAction,
  updateHeroSlideAction,
} from '@/app/admin/actions';
import { type SearchParams, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import { isBlobConfigured } from '@/lib/blob';
import { getAdminHeroSlides } from '@/lib/hero-slides';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Slides | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSlidesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const heroSlides = await getAdminHeroSlides();
  const blobConfigured = isBlobConfigured();

  return (
    <main className={styles.page}>
      <AdminShell
        activeSection="slides"
        currentUser={currentUser}
        description="Manage homepage hero images stored in Vercel Blob."
        title="Slides"
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
                <p className={styles.cardEyebrow}>Homepage media</p>
                <h3 className={styles.panelTitle}>Hero slides</h3>
              </div>
              <span className={styles.counterPill}>{heroSlides.length} custom</span>
            </div>

            <p className={styles.helperText}>
              Upload hero images to Vercel Blob. New slides are added to the end. Use the move buttons on each card to change
              the display order. Maximum file size is 10 MB.
            </p>

            {!blobConfigured ? (
              <div className={styles.warningMessage}>
                <p>
                  Set <code>BLOB_READ_WRITE_TOKEN</code> before uploading hero slides.
                </p>
                <p>
                  Local: add it to <code>.env.local</code> or run <code>vercel env pull</code>.
                </p>
                <p>
                  Production: add it in Vercel Project Settings {'->'} Environment Variables for <code>Production</code>.
                </p>
              </div>
            ) : null}

            <form action={createHeroSlideAction} className={`${styles.form} ${styles.heroUploadForm}`}>
              <label className={styles.field}>
                <span>New hero image</span>
                <input
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={!blobConfigured}
                  name="image"
                  type="file"
                />
              </label>

              <button className={styles.primaryButton} disabled={!blobConfigured} type="submit">
                Upload slide
              </button>
            </form>

            {heroSlides.length === 0 ? (
              <p className={styles.emptyState}>
                No custom hero slides yet. Upload the first image here, and the homepage will switch from static files to Blob
                images.
              </p>
            ) : (
              <div className={styles.heroSlidesList}>
                {heroSlides.map((slide, index) => (
                  <article className={styles.heroSlideCard} key={slide.id}>
                    <div className={styles.heroSlidePreview}>
                      <Image
                        alt={`Hero slide ${index + 1}`}
                        className={styles.heroSlideImage}
                        fill
                        sizes="(max-width: 920px) 100vw, 360px"
                        src={slide.imageUrl}
                      />
                    </div>

                    <div className={styles.heroSlideBody}>
                      <div className={styles.heroSlideHeader}>
                        <div>
                          <p className={styles.cardEyebrow}>Slide {index + 1}</p>
                          <h4 className={styles.heroSlideTitle}>Custom hero image</h4>
                        </div>
                        <div className={styles.heroSlideMeta}>
                          <span className={styles.counterPill}>Position {index + 1}</span>
                          <span className={styles.userMeta}>
                            Added {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(slide.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.heroSlideControls}>
                        <div className={styles.heroMoveActions}>
                          <form action={moveHeroSlideAction}>
                            <input name="slideId" type="hidden" value={slide.id} />
                            <input name="direction" type="hidden" value="up" />
                            <button className={styles.secondaryButton} disabled={index === 0} type="submit">
                              Move up
                            </button>
                          </form>

                          <form action={moveHeroSlideAction}>
                            <input name="slideId" type="hidden" value={slide.id} />
                            <input name="direction" type="hidden" value="down" />
                            <button className={styles.secondaryButton} disabled={index === heroSlides.length - 1} type="submit">
                              Move down
                            </button>
                          </form>
                        </div>

                        <form action={deleteHeroSlideAction} className={styles.heroDeleteForm}>
                          <input name="slideId" type="hidden" value={slide.id} />
                          <button className={styles.ghostButton} disabled={!blobConfigured} type="submit">
                            Delete slide
                          </button>
                        </form>
                      </div>

                      <form action={updateHeroSlideAction} className={`${styles.form} ${styles.heroSlideForm}`}>
                        <input name="slideId" type="hidden" value={slide.id} />

                        <div className={styles.heroSlideReplace}>
                          <label className={styles.heroSlideReplaceLabel} htmlFor={`hero-slide-image-${slide.id}`}>
                            Choose new image
                          </label>

                          <div className={styles.heroSlideReplaceRow}>
                            <input
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              className={styles.heroSlideFileInput}
                              disabled={!blobConfigured}
                              id={`hero-slide-image-${slide.id}`}
                              name="image"
                              type="file"
                            />

                            <div className={styles.heroSlideActions}>
                              <button className={styles.secondaryButton} disabled={!blobConfigured} type="submit">
                                Update image
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
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

import type { Metadata } from 'next';
import Image from 'next/image';
import { AdminShell } from '@/app/admin/AdminShell';
import {
  createFabricOptionAction,
  deleteFabricOptionAction,
  moveFabricOptionAction,
  updateFabricOptionAction,
} from '@/app/admin/actions';
import { type SearchParams, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import { isBlobConfigured } from '@/lib/blob';
import { getAdminFabricOptions } from '@/lib/fabric-options';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Fabrics | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFabricsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const fabricOptions = await getAdminFabricOptions();
  const blobConfigured = isBlobConfigured();

  return (
    <main className={styles.page}>
      <AdminShell
        activeSection="fabrics"
        currentUser={currentUser}
        description="Manage Fabric Options images stored in Vercel Blob."
        title="Fabrics"
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
                <h3 className={styles.panelTitle}>Fabric options</h3>
              </div>
              <span className={styles.counterPill}>{fabricOptions.length} custom</span>
            </div>

            <p className={styles.helperText}>
              Upload fabric swatches to Vercel Blob. New options are added to the end. Use the move buttons on each card to
              change the display order. Maximum file size is 10 MB.
            </p>

            {!blobConfigured ? (
              <div className={styles.warningMessage}>
                <p>
                  Set <code>BLOB_READ_WRITE_TOKEN</code> before uploading fabric options.
                </p>
                <p>
                  Local: add it to <code>.env.local</code> or run <code>vercel env pull</code>.
                </p>
                <p>
                  Production: add it in Vercel Project Settings {'->'} Environment Variables for <code>Production</code>.
                </p>
              </div>
            ) : null}

            <form action={createFabricOptionAction} className={`${styles.form} ${styles.heroUploadForm} ${styles.fabricUploadForm}`}>
              <label className={styles.field}>
                <span>Label</span>
                <input defaultValue={`Fabric ${String(fabricOptions.length + 1).padStart(2, '0')}`} name="label" type="text" />
              </label>

              <label className={styles.field}>
                <span>New fabric image</span>
                <input
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={!blobConfigured}
                  name="image"
                  type="file"
                />
              </label>

              <button className={styles.primaryButton} disabled={!blobConfigured} type="submit">
                Upload fabric
              </button>
            </form>

            {fabricOptions.length === 0 ? (
              <p className={styles.emptyState}>
                No custom fabric options yet. Upload the first swatch here, and the homepage will switch from static files to
                Blob images.
              </p>
            ) : (
              <div className={styles.heroSlidesList}>
                {fabricOptions.map((option, index) => (
                  <article className={styles.heroSlideCard} key={option.id}>
                    <div className={styles.heroSlidePreview}>
                      <Image
                        alt={option.label}
                        className={styles.heroSlideImage}
                        fill
                        sizes="(max-width: 920px) 100vw, 360px"
                        src={option.imageUrl}
                      />
                    </div>

                    <div className={styles.heroSlideBody}>
                      <div className={styles.heroSlideHeader}>
                        <div>
                          <p className={styles.cardEyebrow}>Fabric {index + 1}</p>
                          <h4 className={styles.heroSlideTitle}>{option.label}</h4>
                        </div>
                        <div className={styles.heroSlideMeta}>
                          <span className={styles.counterPill}>Position {index + 1}</span>
                          <span className={styles.userMeta}>
                            Added {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(option.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.heroSlideControls}>
                        <div className={styles.heroMoveActions}>
                          <form action={moveFabricOptionAction}>
                            <input name="optionId" type="hidden" value={option.id} />
                            <input name="direction" type="hidden" value="up" />
                            <button className={styles.secondaryButton} disabled={index === 0} type="submit">
                              Move up
                            </button>
                          </form>

                          <form action={moveFabricOptionAction}>
                            <input name="optionId" type="hidden" value={option.id} />
                            <input name="direction" type="hidden" value="down" />
                            <button className={styles.secondaryButton} disabled={index === fabricOptions.length - 1} type="submit">
                              Move down
                            </button>
                          </form>
                        </div>

                        <form action={deleteFabricOptionAction} className={styles.heroDeleteForm}>
                          <input name="optionId" type="hidden" value={option.id} />
                          <button className={styles.ghostButton} disabled={!blobConfigured} type="submit">
                            Delete fabric
                          </button>
                        </form>
                      </div>

                      <form action={updateFabricOptionAction} className={`${styles.form} ${styles.heroSlideForm}`}>
                        <input name="optionId" type="hidden" value={option.id} />

                        <label className={styles.field}>
                          <span>Label</span>
                          <input defaultValue={option.label} name="label" type="text" />
                        </label>

                        <div className={styles.heroSlideReplace}>
                          <label className={styles.heroSlideReplaceLabel} htmlFor={`fabric-option-image-${option.id}`}>
                            Choose new image
                          </label>

                          <div className={styles.heroSlideReplaceRow}>
                            <input
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              className={styles.heroSlideFileInput}
                              disabled={!blobConfigured}
                              id={`fabric-option-image-${option.id}`}
                              name="image"
                              type="file"
                            />

                            <div className={styles.heroSlideActions}>
                              <button className={styles.secondaryButton} disabled={!blobConfigured} type="submit">
                                Save fabric
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

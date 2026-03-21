import type { Metadata } from 'next';
import Image from 'next/image';
import { AdminShell } from '@/app/admin/AdminShell';
import {
  addProjectGalleryImageAction,
  createProjectAction,
  deleteProjectGalleryImageAction,
  deleteProjectAction,
  moveProjectGalleryImageAction,
  moveProjectAction,
  setProjectCoverImageAction,
  updateProjectAction,
} from '@/app/admin/actions';
import { type SearchParams, getMessage, requireAdminPage } from '@/app/admin/admin.utils';
import { isBlobConfigured } from '@/lib/blob';
import {
  getAdminProjects,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECTS_MAX_COUNT,
  PROJECT_TITLE_MAX_LENGTH,
} from '@/lib/projects';
import styles from '../page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Projects | Areve Screen',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentUser = await requireAdminPage();
  const message = getMessage(params);
  const projects = await getAdminProjects();
  const blobConfigured = isBlobConfigured();
  const projectsLimitReached = projects.length >= PROJECTS_MAX_COUNT;
  const uploadDisabled = !blobConfigured || projectsLimitReached;
  const uploadLimitMessage = `Project limit reached. Maximum ${PROJECTS_MAX_COUNT} projects. Delete one project to upload another.`;

  return (
    <main className={styles.page}>
      <AdminShell
        activeSection="projects"
        currentUser={currentUser}
        description="Manage project cards without changing the homepage layout."
        title="Projects"
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
                <h3 className={styles.panelTitle}>Projects</h3>
              </div>
              <span className={styles.counterPill}>{projects.length} custom</span>
            </div>

            <p className={styles.helperText}>
              Manage project cover images, gallery slides, titles, and descriptions from admin. Titles are limited to{' '}
              {PROJECT_TITLE_MAX_LENGTH} characters and descriptions to {PROJECT_DESCRIPTION_MAX_LENGTH} characters to preserve
              the card layout. Cover images stay on the project card, and gallery slides open inside the project viewer. You
              can keep up to {PROJECTS_MAX_COUNT} projects.
            </p>

            {!blobConfigured ? (
              <div className={styles.warningMessage}>
                <p>
                  Set <code>BLOB_READ_WRITE_TOKEN</code> before uploading project images.
                </p>
                <p>
                  Local: add it to <code>.env.local</code> or run <code>vercel env pull</code>.
                </p>
                <p>
                  Production: add it in Vercel Project Settings {'->'} Environment Variables for <code>Production</code>.
                </p>
              </div>
            ) : null}

            <div
              aria-disabled={uploadDisabled}
              className={`${projectsLimitReached ? styles.uploadLimitWrapper : ''} ${
                uploadDisabled ? styles.uploadLimitDisabled : ''
              }`.trim()}
            >
              <form action={createProjectAction} className={`${styles.form} ${styles.projectUploadForm}`}>
                <div className={styles.projectCreateTopRow}>
                  <label className={styles.field}>
                    <span>Title</span>
                    <input
                      defaultValue={`Project ${String(projects.length + 1).padStart(2, '0')}`}
                      disabled={uploadDisabled}
                      maxLength={PROJECT_TITLE_MAX_LENGTH}
                      name="title"
                      type="text"
                    />
                  </label>

                  <button className={styles.primaryButton} disabled={uploadDisabled} type="submit">
                    Upload project
                  </button>
                </div>

                <label className={`${styles.field} ${styles.projectDescriptionField}`}>
                  <span>Description</span>
                  <textarea
                    className={styles.projectTextarea}
                    disabled={uploadDisabled}
                    maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                    name="description"
                    rows={3}
                  />
                </label>

                <label className={`${styles.field} ${styles.projectImageField}`}>
                  <span>Cover image</span>
                  <input
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploadDisabled}
                    name="image"
                    type="file"
                  />
                </label>
              </form>

              {projectsLimitReached ? (
                <>
                  <button
                    aria-describedby="project-upload-limit-tooltip"
                    aria-label={uploadLimitMessage}
                    className={styles.uploadLimitOverlay}
                    title={uploadLimitMessage}
                    type="button"
                  />
                  <div className={styles.uploadLimitTooltip} id="project-upload-limit-tooltip" role="status">
                    Project limit reached. Maximum {PROJECTS_MAX_COUNT} projects. Delete one project to upload another.
                  </div>
                </>
              ) : null}
            </div>

            {projects.length === 0 ? (
              <p className={styles.emptyState}>
                No custom projects yet. Upload the first project here, and the homepage will switch from static files to Blob
                and database content.
              </p>
            ) : (
              <div className={styles.heroSlidesList}>
                {projects.map((project, index) => (
                  <article className={styles.heroSlideCard} key={project.id}>
                    <div className={styles.heroSlidePreview}>
                      <Image
                        alt={project.title}
                        className={styles.heroSlideImage}
                        fill
                        sizes="(max-width: 920px) 100vw, 360px"
                        src={project.coverImageUrl}
                      />
                    </div>

                    <div className={styles.heroSlideBody}>
                      <div className={styles.heroSlideHeader}>
                        <div>
                          <p className={styles.cardEyebrow}>Project {index + 1}</p>
                          <h4 className={styles.heroSlideTitle}>{project.title}</h4>
                        </div>
                        <div className={styles.heroSlideMeta}>
                          <span className={styles.counterPill}>Position {index + 1}</span>
                          <span className={styles.counterPill}>
                            {project.galleryImageUrls.length} gallery {project.galleryImageUrls.length === 1 ? 'slide' : 'slides'}
                          </span>
                          <span className={styles.userMeta}>
                            Added {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(project.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.heroSlideControls}>
                        <div className={styles.heroMoveActions}>
                          <form action={moveProjectAction}>
                            <input name="projectId" type="hidden" value={project.id} />
                            <input name="direction" type="hidden" value="up" />
                            <button className={styles.secondaryButton} disabled={index === 0} type="submit">
                              Move up
                            </button>
                          </form>

                          <form action={moveProjectAction}>
                            <input name="projectId" type="hidden" value={project.id} />
                            <input name="direction" type="hidden" value="down" />
                            <button className={styles.secondaryButton} disabled={index === projects.length - 1} type="submit">
                              Move down
                            </button>
                          </form>
                        </div>

                        <form action={deleteProjectAction} className={styles.heroDeleteForm}>
                          <input name="projectId" type="hidden" value={project.id} />
                          <button className={styles.ghostButton} disabled={!blobConfigured} type="submit">
                            Delete project
                          </button>
                        </form>
                      </div>

                      <form action={updateProjectAction} className={`${styles.form} ${styles.heroSlideForm}`}>
                        <input name="projectId" type="hidden" value={project.id} />

                        <div className={styles.projectTextFields}>
                          <label className={styles.field}>
                            <span>Title</span>
                            <input
                              defaultValue={project.title}
                              maxLength={PROJECT_TITLE_MAX_LENGTH}
                              name="title"
                              type="text"
                            />
                          </label>

                          <label className={styles.field}>
                            <span>Description</span>
                            <textarea
                              defaultValue={project.description}
                              maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                              name="description"
                              rows={4}
                            />
                          </label>
                        </div>

                        <div className={styles.heroSlideReplace}>
                          <label className={styles.heroSlideReplaceLabel} htmlFor={`project-image-${project.id}`}>
                            Choose new cover image
                          </label>

                          <div className={styles.heroSlideReplaceRow}>
                            <input
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              className={styles.heroSlideFileInput}
                              disabled={!blobConfigured}
                              id={`project-image-${project.id}`}
                              name="image"
                              type="file"
                            />

                            <div className={styles.heroSlideActions}>
                              <button className={styles.secondaryButton} type="submit">
                                Save project
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>

                      <section className={styles.projectGallerySection}>
                        <div className={styles.projectGalleryHeader}>
                          <div>
                            <p className={styles.cardEyebrow}>Project gallery</p>
                            <h5 className={styles.projectGalleryTitle}>
                              {project.galleryImageUrls.length === 0
                                ? 'No gallery slides yet'
                                : `${project.galleryImageUrls.length} gallery ${
                                    project.galleryImageUrls.length === 1 ? 'slide' : 'slides'
                                  }`}
                            </h5>
                            <p className={styles.projectGalleryLead}>
                              Upload extra slides here, reorder them, or promote any slide to the cover image.
                            </p>
                          </div>

                          <form action={addProjectGalleryImageAction} className={styles.projectGalleryUploadForm}>
                            <input name="projectId" type="hidden" value={project.id} />

                            <label className={styles.heroSlideReplaceLabel} htmlFor={`project-gallery-image-${project.id}`}>
                              Add gallery slide
                            </label>

                            <div className={styles.projectGalleryUploadRow}>
                              <input
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                className={styles.heroSlideFileInput}
                                disabled={!blobConfigured}
                                id={`project-gallery-image-${project.id}`}
                                name="image"
                                type="file"
                              />

                              <button className={styles.secondaryButton} disabled={!blobConfigured} type="submit">
                                Upload slide
                              </button>
                            </div>
                          </form>
                        </div>

                        {project.galleryImageUrls.length === 0 ? (
                          <p className={styles.projectGalleryEmpty}>
                            This project currently has only a cover image. Add gallery slides to show multiple images in the
                            project viewer.
                          </p>
                        ) : (
                          <div className={styles.projectGalleryList}>
                            {project.galleryImageUrls.map((imageUrl, galleryIndex) => (
                              <article className={styles.projectGalleryCard} key={`${project.id}-${imageUrl}-${galleryIndex}`}>
                                <div className={styles.projectGalleryPreview}>
                                  <Image
                                    alt={`${project.title} gallery slide ${galleryIndex + 1}`}
                                    className={styles.projectGalleryImage}
                                    fill
                                    sizes="(max-width: 920px) 100vw, 140px"
                                    src={imageUrl}
                                  />
                                </div>

                                <div className={styles.projectGalleryBody}>
                                  <div className={styles.projectGalleryMeta}>
                                    <div>
                                      <p className={styles.projectGalleryLabel}>Gallery slide {galleryIndex + 1}</p>
                                      <p className={styles.userMeta}>
                                        Shows after the cover image in the project viewer.
                                      </p>
                                    </div>
                                    <span className={styles.counterPill}>Position {galleryIndex + 1}</span>
                                  </div>

                                  <div className={styles.projectGalleryControls}>
                                    <form action={moveProjectGalleryImageAction}>
                                      <input name="projectId" type="hidden" value={project.id} />
                                      <input name="galleryIndex" type="hidden" value={galleryIndex} />
                                      <input name="direction" type="hidden" value="up" />
                                      <button className={styles.secondaryButton} disabled={galleryIndex === 0} type="submit">
                                        Move up
                                      </button>
                                    </form>

                                    <form action={moveProjectGalleryImageAction}>
                                      <input name="projectId" type="hidden" value={project.id} />
                                      <input name="galleryIndex" type="hidden" value={galleryIndex} />
                                      <input name="direction" type="hidden" value="down" />
                                      <button
                                        className={styles.secondaryButton}
                                        disabled={galleryIndex === project.galleryImageUrls.length - 1}
                                        type="submit"
                                      >
                                        Move down
                                      </button>
                                    </form>

                                    <form action={setProjectCoverImageAction}>
                                      <input name="projectId" type="hidden" value={project.id} />
                                      <input name="galleryIndex" type="hidden" value={galleryIndex} />
                                      <button className={styles.secondaryButton} type="submit">
                                        Make cover
                                      </button>
                                    </form>

                                    <form action={deleteProjectGalleryImageAction}>
                                      <input name="projectId" type="hidden" value={project.id} />
                                      <input name="galleryIndex" type="hidden" value={galleryIndex} />
                                      <button className={styles.ghostButton} disabled={!blobConfigured} type="submit">
                                        Delete slide
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </section>
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

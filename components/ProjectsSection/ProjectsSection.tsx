'use client';

import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import type { ProjectItem } from '@/data/siteContent';
import styles from './ProjectsSection.module.css';

type ProjectsSectionProps = {
  items: ProjectItem[];
};

type ActiveGallery = {
  projectIndex: number;
  imageIndex: number;
} | null;

const getProjectImages = (item: ProjectItem) => [...new Set([item.cover, ...item.gallery])];

export function ProjectsSection({ items }: ProjectsSectionProps) {
  const [activeGallery, setActiveGallery] = useState<ActiveGallery>(null);

  const activeProject = activeGallery ? items[activeGallery.projectIndex] : null;
  const activeImages = activeProject ? getProjectImages(activeProject) : [];
  const activeImage =
    activeGallery && activeImages.length > 0
      ? activeImages[activeGallery.imageIndex] ?? activeImages[0]
      : null;

  const openGallery = (projectIndex: number, imageIndex = 0) => {
    setActiveGallery({ projectIndex, imageIndex });
  };

  const closeGallery = () => {
    setActiveGallery(null);
  };

  const showPreviousImage = () => {
    setActiveGallery((current) => {
      if (!current) {
        return current;
      }

      const images = getProjectImages(items[current.projectIndex]);
      const nextIndex = (current.imageIndex - 1 + images.length) % images.length;

      return { ...current, imageIndex: nextIndex };
    });
  };

  const showNextImage = () => {
    setActiveGallery((current) => {
      if (!current) {
        return current;
      }

      const images = getProjectImages(items[current.projectIndex]);
      const nextIndex = (current.imageIndex + 1) % images.length;

      return { ...current, imageIndex: nextIndex };
    });
  };

  useEffect(() => {
    if (!activeGallery) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeGallery();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousImage();
      }

      if (event.key === 'ArrowRight') {
        showNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeGallery, items]);

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>, projectIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGallery(projectIndex);
    }
  };

  return (
    <section className={styles.section} id="projects">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headingBlock}>
            <span className={styles.kicker}>Our Latest Project</span>
            <h2 className={styles.heading}>We make it possible for you to have an elevated lifestyle</h2>
          </div>

          <div className={styles.copyBlock}>
            <p>
              Dive into our projects, where innovative design meets superior quality. From refined
              residences to impressive commercial properties, each one is crafted to inspire and
              captivate, elevating your perception of life to new heights.
            </p>
            <span className={styles.divider} />
          </div>
        </div>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <article
              key={item.title}
              aria-label={`Open ${item.title} gallery`}
              className={styles.card}
              onClick={() => openGallery(index)}
              onKeyDown={(event) => handleCardKeyDown(event, index)}
              role="button"
              style={{ '--project-image': `url(${item.cover})` } as CSSProperties}
              tabIndex={0}
            >
              <div className={styles.front}>
                <h3>{item.title}</h3>
              </div>

              <div className={styles.back}>
                <p>{item.description}</p>
                <span className={styles.showMore}>Show more</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeGallery && activeProject && activeImage ? (
        <div aria-modal="true" className={styles.viewer} role="dialog">
          <div aria-hidden="true" className={styles.viewerBackdrop} onClick={closeGallery} />

          <div className={styles.viewerPanel}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerMeta}>
                <h3>{activeProject.title}</h3>
                <span>
                  {activeGallery.imageIndex + 1} / {activeImages.length}
                </span>
              </div>

              <button
                aria-label="Close project gallery"
                className={styles.viewerClose}
                onClick={closeGallery}
                type="button"
              >
                Close
              </button>
            </div>

            <div className={styles.viewerStage}>
              <button
                aria-label="Previous image"
                className={`${styles.viewerNav} ${styles.viewerNavPrev}`}
                onClick={showPreviousImage}
                type="button"
              >
                <span aria-hidden="true">‹</span>
              </button>

              <div className={styles.viewerImageWrap}>
                <Image
                  alt={`${activeProject.title} image ${activeGallery.imageIndex + 1}`}
                  className={styles.viewerImage}
                  fill
                  sizes="(max-width: 980px) 100vw, 1100px"
                  src={activeImage}
                />
              </div>

              <button
                aria-label="Next image"
                className={`${styles.viewerNav} ${styles.viewerNavNext}`}
                onClick={showNextImage}
                type="button"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <div className={styles.viewerThumbs}>
              {activeImages.map((image, index) => (
                <button
                  aria-label={`View image ${index + 1}`}
                  className={`${styles.viewerThumb} ${
                    index === activeGallery.imageIndex ? styles.viewerThumbActive : ''
                  }`}
                  key={image}
                  onClick={() => openGallery(activeGallery.projectIndex, index)}
                  type="button"
                >
                  <Image
                    alt=""
                    className={styles.viewerThumbImage}
                    fill
                    sizes="88px"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

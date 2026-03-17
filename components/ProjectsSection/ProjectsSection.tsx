import type { CSSProperties } from 'react';
import type { ProjectItem } from '@/data/siteContent';
import styles from './ProjectsSection.module.css';

type ProjectsSectionProps = {
  items: ProjectItem[];
};

export function ProjectsSection({ items }: ProjectsSectionProps) {
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
              captivate.
            </p>
            <span className={styles.divider} />
          </div>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <article
              key={item.title}
              className={styles.card}
              style={{ '--project-image': `url(${item.cover})` } as CSSProperties}
            >
              <div className={styles.front}>
                <h3>{item.title}</h3>
              </div>

              <div className={styles.back}>
                <p>{item.description}</p>
                <a href="#contact">Show more</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TechnologyItem } from '@/data/siteContent';
import styles from './TechnologySection.module.css';

type TechnologySectionProps = {
  items: TechnologyItem[];
};

export function TechnologySection({ items }: TechnologySectionProps) {
  const groups = items.reduce<TechnologyItem[][]>((chunks, item, index) => {
    const chunkIndex = Math.floor(index / 2);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);

  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={styles.section} id="specialties">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.heading}>THE AREVE DIFFERENCE</h2>
          <ul className={styles.list}>
            <li>Our Screens: Zipper-Free Design</li>
            <li>Adjustable Tracks</li>
            <li>Top-grade materials for durability and longevity</li>
            <li>Seamlessly blend with existing architecture or decor</li>
            <li>Predefined sizes: ensuring precise fit to your needs</li>
            <li>Expert installation</li>
          </ul>
          <a className={styles.button} href="#contact">
            Contact us
          </a>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabList} aria-label="Technology tabs" role="tablist">
            {groups.map((group, index) => (
              <button
                aria-label={`Show technology group ${index + 1}`}
                key={`tab-${group[0]?.title ?? index}`}
                aria-controls={`technology-panel-${index}`}
                aria-selected={activeTab === index}
                className={`${styles.tabButton} ${activeTab === index ? styles.tabButtonActive : ''}`}
                id={`technology-tab-${index}`}
                onClick={() => setActiveTab(index)}
                role="tab"
                tabIndex={activeTab === index ? 0 : -1}
                type="button"
              >
                <span className={styles.tabDot} />
              </button>
            ))}
          </div>

          <div className={styles.tabPanels}>
            {groups.map((group, index) => (
              <div
                key={`panel-${group[0]?.title ?? index}`}
                aria-labelledby={`technology-tab-${index}`}
                className={`${styles.grid} ${activeTab === index ? styles.gridActive : ''}`}
                id={`technology-panel-${index}`}
                role="tabpanel"
              >
                {group.map((item) => (
                  <article key={item.title} className={styles.card}>
                    <div className={styles.imageWrap}>
                      <Image
                        alt={item.title}
                        className={styles.image}
                        fill
                        sizes="(max-width: 920px) 100vw, 50vw"
                        src={item.image}
                      />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

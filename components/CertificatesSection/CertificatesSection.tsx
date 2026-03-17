import Image from 'next/image';
import type { CertificateItem } from '@/data/siteContent';
import styles from './CertificatesSection.module.css';

type CertificatesSectionProps = {
  items: CertificateItem[];
};

export function CertificatesSection({ items }: CertificatesSectionProps) {
  return (
    <section className={styles.section} id="certificates">
      <div className={styles.inner}>
        <div className={styles.headingBlock}>
          <h2 className={styles.heading}>Certificates</h2>
          <span className={styles.divider} />
        </div>

        <div className={styles.rail} aria-label="Certificates">
          {items.map((item) => (
            <article key={item.label} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  alt={item.label}
                  className={styles.image}
                  fill
                  sizes="(max-width: 920px) 34vw, 150px"
                  src={item.image}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

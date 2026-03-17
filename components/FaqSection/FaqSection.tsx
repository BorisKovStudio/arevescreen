import Image from 'next/image';
import type { FaqItem } from '@/data/siteContent';
import styles from './FaqSection.module.css';

type FaqSectionProps = {
  items: FaqItem[];
  image: string;
};

export function FaqSection({ items, image }: FaqSectionProps) {
  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        <div className={styles.visualColumn}>
          <span className={styles.kicker}>Frequently Asked Questions</span>
          <p className={styles.subtitle}>Answers Await: Explore Our FAQ Section</p>
          <span className={styles.divider} />
          <div className={styles.imageAccent} />
          <div className={styles.imageFrame}>
            <Image
              alt="Patio screen detail"
              className={styles.image}
              fill
              sizes="(max-width: 920px) 100vw, 35vw"
              src={image}
            />
          </div>
        </div>

        <div className={styles.stack}>
          {items.map((item, index) => (
            <details key={item.question} className={styles.item} open={index === 0}>
              <summary className={styles.summary}>{item.question}</summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

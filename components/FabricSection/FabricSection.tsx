import Image from 'next/image';
import type { FabricOption } from '@/data/siteContent';
import styles from './FabricSection.module.css';

type FabricSectionProps = {
  fabricOptions: FabricOption[];
  highlightImage: string;
};

export function FabricSection({ fabricOptions, highlightImage }: FabricSectionProps) {
  return (
    <section className={styles.section} id="fabrics">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headingBlock}>
            <h2 className={styles.heading}>Fabric Options</h2>
            <span className={styles.divider} />
          </div>

          <div className={styles.rail} aria-label="Fabric options">
            {fabricOptions.map((option) => (
              <article key={option.label} className={styles.swatch}>
                <div className={styles.swatchImageWrap}>
                  <Image
                    alt={option.label}
                    className={styles.swatchImage}
                    fill
                    sizes="(max-width: 920px) 28vw, 140px"
                    src={option.image}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.showcase}>
          <div className={styles.copyCard}>
            <h3>Various fabric choices available.</h3>
            <p>
              We provide a range of fabrics with varying degrees of light permeability to
              accommodate your preferences and requirements.
            </p>
          </div>

          <div className={styles.imageFrame}>
            <Image
              alt="Areve fabric example"
              className={styles.image}
              fill
              sizes="(max-width: 920px) 100vw, 50vw"
              src={highlightImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import styles from './DifferenceSection.module.css';

type DifferenceSectionProps = {
  backgroundImage: string;
  bullets: string[];
};

export function DifferenceSection({ backgroundImage, bullets: _bullets }: DifferenceSectionProps) {
  return (
    <section className={styles.section} id="difference">
      <div className={styles.band} style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className={styles.bandOverlay} />
        <div className={styles.bandInner}>
          <span className={styles.bandDivider} />
          <h2 className={styles.bandHeading}>All Seasons Comfort</h2>
          <p className={styles.bandText}>Reliable screens for dependable protection</p>
        </div>
      </div>

      <div className={styles.content}>
        <span className={styles.kicker}>Why Choose Us</span>
        <h2 className={styles.heading}>Redefining Excellence with Innovative Screens</h2>
        <p className={styles.text}>
          At Areve, innovation defines us. Our commitment to exploring new ideas ensures that our
          products stand out as the best available. With reliability, strength, and innovation, we
          lead the way. Plus, our screens don&apos;t use zippers.
        </p>
      </div>
    </section>
  );
}

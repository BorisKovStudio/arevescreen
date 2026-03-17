import Image from 'next/image';
import type { IntroPillar } from '@/data/siteContent';
import styles from './IntroSection.module.css';

type IntroSectionProps = {
  image: string;
  video: string;
  videoPoster: string;
  years: string;
  pillars: IntroPillar[];
};

export function IntroSection({ image, video, videoPoster, years, pillars }: IntroSectionProps) {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.mediaColumn}>
          <div className={styles.visual}>
            <div className={styles.primaryFrame}>
              <Image
                alt="Areve residential screen installation"
                className={styles.image}
                fill
                sizes="(max-width: 920px) 100vw, 34vw"
                src={image}
              />
            </div>

            <div className={styles.secondaryFrame}>
              <div className={styles.secondaryInner}>
                <video
                  autoPlay
                  className={styles.video}
                  controlsList="nodownload"
                  loop
                  muted
                  playsInline
                  poster={videoPoster}
                  src={video}
                />
              </div>
            </div>

            <div className={styles.counter}>
              <strong className={styles.counterValue}>{years}</strong>
              <span className={styles.counterText}>Years</span>
              <span className={styles.counterText}>Experience</span>
            </div>
          </div>
        </div>

        <div className={styles.copy}>
          <span className={styles.kicker}>Welcome to Areve</span>
          <h2 className={styles.heading}>Transforming Spaces, Elevating Experiences</h2>
          <p className={styles.text}>
            Areve - your trusted partner in creating comfortable outdoor spaces. We specialize in
            retractable shade screens, offering high-quality solutions for your home or business.
            Our American manufacturing ensures the reliability and durability of our products.
            Choose Areve for unparalleled quality and comfort.
          </p>

          <div className={styles.pillars}>
            {pillars.map((pillar) => (
              <article key={pillar.title} className={styles.pillar}>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              </article>
            ))}
          </div>

          <a className={styles.button} href="#specialties">
            Areve difference
          </a>
        </div>
      </div>
    </section>
  );
}

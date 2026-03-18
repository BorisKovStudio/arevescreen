import Image from 'next/image';
import type { InsectScreenFeature } from '@/data/siteContent';
import styles from './InsectScreensSection.module.css';

type InsectScreensSectionProps = {
  kicker: string;
  heading: string;
  lead: string;
  body: string;
  image: string;
  video: string;
  videoPoster: string;
  applications: string[];
  features: InsectScreenFeature[];
};

export function InsectScreensSection({
  kicker,
  heading,
  lead,
  body,
  image,
  video,
  videoPoster,
  applications,
  features,
}: InsectScreensSectionProps) {
  return (
    <section className={styles.section} id="insect-screens">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.kicker}>{kicker}</span>
          <h2 className={styles.heading}>{heading}</h2>
          <p className={styles.lead}>{lead}</p>
          <p className={styles.body}>{body}</p>

          <div className={styles.applicationRow} aria-label="Ideal applications">
            {applications.map((application) => (
              <span className={styles.applicationPill} key={application}>
                {application}
              </span>
            ))}
          </div>

          <div className={styles.features}>
            {features.map((feature) => (
              <article className={styles.featureCard} key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>

          <a className={styles.button} href="#contact">
            Request quote
          </a>
        </div>

        <div className={styles.mediaColumn}>
          <div className={styles.mediaBackdrop} />

          <div className={styles.videoFrame}>
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

          <div className={styles.imageFrame}>
            <Image
              alt="Insect screen installation detail"
              className={styles.image}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1100px) 45vw, 28vw"
              src={image}
            />
          </div>

          <aside className={styles.noteCard}>
            <span className={styles.noteEyebrow}>Built for airflow</span>
            <h3>Wide openings, cleaner comfort</h3>
            <p>
              A better fit for open-concept patio transitions where you want ventilation, visual
              lightness, and insect control in one integrated move.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

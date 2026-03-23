import Image from 'next/image';
import type { ContactDetails, SocialLink } from '@/data/siteContent';
import styles from './SiteFooter.module.css';

type SiteFooterProps = {
  details: ContactDetails;
  socialLinks: SocialLink[];
};

export function SiteFooter({ details, socialLinks: _socialLinks }: SiteFooterProps) {
  const email = details.email.toLowerCase();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image alt="Areve Screen" className={styles.logo} height={140} src="/media/brand/logo.png" width={538} />
        </div>

        <div className={styles.block}>
          <a className={styles.blockTitle} href={details.mapUrl} rel="noreferrer" target="_blank">
            Address :
          </a>
          <p className={styles.blockText}>{details.address}</p>
        </div>

        <div className={styles.block}>
          <p className={styles.blockTitle}>Opening hours :</p>
          {details.hours.map((hour) => (
            <p key={hour} className={styles.blockText}>
              {hour}
            </p>
          ))}
        </div>

        <div className={styles.block}>
          <a className={styles.inlineLine} href={`tel:${details.phone.replace(/[^+\d]/g, '')}`}>
            <span>Phone :</span> {details.phone}
          </a>
          <a className={styles.inlineLine} href={`mailto:${email}`}>
            <span>Email :</span> {email}
          </a>
        </div>

        <div className={styles.block}>
          <a className={styles.copyright} href="https://boriskov.com" rel="noreferrer" target="_blank">
            Copyright © {currentYear} Areve - <span className={styles.noWrap}>All Seasons Comfort.</span>
            <br />
            Powered by BorisKov studio
          </a>
        </div>
      </div>
    </footer>
  );
}

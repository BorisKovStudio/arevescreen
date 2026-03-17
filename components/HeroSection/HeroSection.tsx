'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

type HeroSectionProps = {
  slides: string[];
};

export function HeroSection({ slides }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  return (
    <section className={styles.hero}>
      <div className={styles.frame}>
        {slides.map((slide, index) => (
          <div
            key={slide}
            aria-hidden={index !== activeIndex}
            className={`${styles.slide} ${index === activeIndex ? styles.slideActive : ''}`}
          >
            <Image
              alt="Areve hero installation"
              className={styles.image}
              fill
              priority={index === 0}
              sizes="100vw"
              src={slide}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

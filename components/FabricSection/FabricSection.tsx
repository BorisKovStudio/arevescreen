'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { FabricOption } from '@/data/siteContent';
import styles from './FabricSection.module.css';

const DEFAULT_MARQUEE_SPEED = 78;
const HOVER_MARQUEE_SPEED = 52;

type FabricSectionProps = {
  fabricOptions: FabricOption[];
  highlightImage: string;
};

export function FabricSection({ fabricOptions, highlightImage }: FabricSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railTrackRef = useRef<HTMLDivElement | null>(null);
  const railGroupRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const groupWidthRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const currentSpeedRef = useRef(DEFAULT_MARQUEE_SPEED);
  const targetSpeedRef = useRef(DEFAULT_MARQUEE_SPEED);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);

      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);

    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    const group = railGroupRef.current;
    const track = railTrackRef.current;

    if (!group || !track) {
      return;
    }

    const syncWidth = () => {
      groupWidthRef.current = group.getBoundingClientRect().width;

      if (groupWidthRef.current > 0 && offsetRef.current <= -groupWidthRef.current) {
        offsetRef.current %= groupWidthRef.current;
      }

      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };

    syncWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(syncWidth);
      resizeObserver.observe(group);

      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', syncWidth);

    return () => window.removeEventListener('resize', syncWidth);
  }, [fabricOptions.length]);

  useEffect(() => {
    const track = railTrackRef.current;

    if (!track) {
      return;
    }

    if (!isVisible || prefersReducedMotion) {
      track.style.transform = 'translate3d(0, 0, 0)';
      offsetRef.current = 0;
      currentSpeedRef.current = DEFAULT_MARQUEE_SPEED;
      targetSpeedRef.current = DEFAULT_MARQUEE_SPEED;
      lastFrameTimeRef.current = null;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return;
    }

    const animate = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.05);
      lastFrameTimeRef.current = timestamp;

      const speedBlend = 1 - Math.exp(-4 * deltaSeconds);
      currentSpeedRef.current +=
        (targetSpeedRef.current - currentSpeedRef.current) * speedBlend;

      const groupWidth = groupWidthRef.current;

      if (groupWidth > 0) {
        offsetRef.current -= currentSpeedRef.current * deltaSeconds;

        while (offsetRef.current <= -groupWidth) {
          offsetRef.current += groupWidth;
        }

        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      lastFrameTimeRef.current = null;
    };
  }, [isVisible, prefersReducedMotion]);

  const slowDownMarquee = () => {
    targetSpeedRef.current = HOVER_MARQUEE_SPEED;
  };

  const normalizeMarqueeSpeed = () => {
    targetSpeedRef.current = DEFAULT_MARQUEE_SPEED;
  };

  return (
    <section ref={sectionRef} className={styles.section} id="fabrics">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={`${styles.headingBlock} ${isVisible ? styles.headingBlockVisible : ''}`}>
            <h2 className={styles.heading}>Fabric Options</h2>
            <span className={styles.divider} />
          </div>

          <div
            className={`${styles.railViewport} ${isVisible ? styles.railViewportVisible : ''}`}
            aria-label="Fabric options"
            onMouseEnter={slowDownMarquee}
            onMouseLeave={normalizeMarqueeSpeed}
            onTouchStart={slowDownMarquee}
            onTouchEnd={normalizeMarqueeSpeed}
          >
            <div ref={railTrackRef} className={styles.railTrack}>
              <div ref={railGroupRef} className={styles.railGroup}>
                {fabricOptions.map((option) => (
                  <article key={`primary-${option.label}`} className={styles.swatch}>
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

              <div aria-hidden="true" className={`${styles.railGroup} ${styles.railGroupDuplicate}`}>
                {fabricOptions.map((option) => (
                  <article key={`duplicate-${option.label}`} className={styles.swatch}>
                    <div className={styles.swatchImageWrap}>
                      <Image
                        alt=""
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

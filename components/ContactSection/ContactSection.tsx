'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { ContactDetails } from '@/data/siteContent';
import styles from './ContactSection.module.css';

type ContactCalcTier = {
  minSqft: number;
  maxSqft: number;
  pricePerSqft: number;
};

type ContactSectionProps = {
  details: ContactDetails;
  calcTiers: ContactCalcTier[];
};

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  place: string;
  length: string;
  width: string;
  message: string;
};

const initialState: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  place: '',
  length: '',
  width: '',
  message: '',
};

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const dimensionOptions = Array.from({ length: 24 }, (_, index) => {
  const value = String(index + 2);

  return {
    value,
    label: `${value} FT`,
  };
});

export function ContactSection({ details, calcTiers }: ContactSectionProps) {
  const [form, setForm] = useState<ContactFormState>(initialState);

  const lengthValue = parsePositiveInteger(form.length);
  const widthValue = parsePositiveInteger(form.width);
  const area = lengthValue && widthValue ? lengthValue * widthValue : null;
  const matchingTier =
    area !== null
      ? calcTiers.find((tier) => area >= tier.minSqft && area < tier.maxSqft) ?? null
      : null;
  const estimatedPrice = area !== null && matchingTier ? area * matchingTier.pricePerSqft : null;
  const matchedRate = matchingTier?.pricePerSqft ?? null;

  const estimateTitle =
    estimatedPrice !== null
      ? `$${estimatedPrice.toLocaleString('en-US')}`
      : calcTiers.length === 0
        ? 'Setup required'
        : area !== null
          ? 'No matching tier'
          : 'Preview estimate';

  const estimateCaption =
    estimatedPrice !== null
      ? `${area} sqft at $${matchedRate}/sqft`
      : calcTiers.length === 0
        ? 'Estimate will appear after calc periods are configured.'
        : area !== null
          ? `No configured price for ${area} sqft.`
          : 'Select height and width to see your estimate before sending.';

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    if ((name === 'length' || name === 'width') && value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Quote request from ${form.name.trim() || 'Areve website visitor'}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${form.name || '-'}`,
        `Phone: ${form.phone || '-'}`,
        `Email: ${form.email || '-'}`,
        `Place: ${form.place || '-'}`,
        `Height: ${form.length || '-'}`,
        `Width: ${form.width || '-'}`,
        `Area: ${area ?? '-'}`,
        `Estimated price: ${estimatedPrice !== null ? `$${estimatedPrice.toLocaleString('en-US')}` : 'Unavailable'}`,
        '',
        'Message:',
        form.message || '-',
      ].join('\n'),
    );

    window.location.href = `mailto:${details.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.heading}>Get in Touch</h2>
          <p className={styles.text}>
            Step into a world of possibilities. Get in touch with us today and let&apos;s bring your
            dreams to life together.
          </p>

          <article className={styles.infoRow}>
            <span className={styles.infoTitle}>Phone</span>
            <a href={`tel:${details.phone.replace(/[^+\d]/g, '')}`}>{details.phone}</a>
          </article>

          <article className={styles.infoRow}>
            <span className={styles.infoTitle}>E-mail Address</span>
            <a href={`mailto:${details.email}`}>{details.email}</a>
          </article>

          <article className={styles.infoRow}>
            <span className={styles.infoTitle}>Address</span>
            <a href={details.mapUrl} rel="noreferrer" target="_blank">
              {details.address}
            </a>
          </article>
        </div>

        <div className={styles.formShell}>
          <div className={styles.formHeader}>
            <h3>Request Your Quote Today!</h3>
            <span className={styles.divider} />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                required
                name="name"
                onChange={handleChange}
                placeholder="Name"
                type="text"
                value={form.name}
              />
            </label>

            <label className={styles.field}>
              <span>Phone</span>
              <input
                required
                name="phone"
                onChange={handleChange}
                placeholder="Phone"
                type="tel"
                value={form.phone}
              />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                required
                name="email"
                onChange={handleChange}
                placeholder="Email"
                type="email"
                value={form.email}
              />
            </label>

            <label className={styles.field}>
              <span>Place</span>
              <input
                required
                name="place"
                onChange={handleChange}
                placeholder="Zip-code"
                type="text"
                value={form.place}
              />
            </label>

            <div className={styles.calcFieldsRow}>
              <label className={`${styles.field} ${styles.calcField}`}>
                <span className={styles.fieldLabel}>
                  <span>Height</span>
                  <span className={styles.calcHelp}>
                    <button
                      aria-describedby="contact-estimate-tooltip"
                      aria-label="Estimate info"
                      className={styles.calcHelpButton}
                      type="button"
                    >
                      i
                    </button>
                    <span className={styles.calcTooltip} id="contact-estimate-tooltip" role="tooltip">
                      <strong className={styles.calcTooltipTitle}>See your estimate before sending</strong>
                      <span>Select height and width in feet.</span>
                    </span>
                  </span>
                </span>
                <select
                  name="length"
                  onChange={handleChange}
                  required
                  value={form.length}
                >
                  <option disabled value="">
                    Height
                  </option>
                  {dimensionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.field} ${styles.calcField}`}>
                <span>Width</span>
                <select
                  name="width"
                  onChange={handleChange}
                  required
                  value={form.width}
                >
                  <option disabled value="">
                    Width
                  </option>
                  {dimensionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className={`${styles.estimateBox} ${styles.estimateBoxCompact} ${
                  estimatedPrice === null ? styles.estimateBoxMuted : ''
                }`.trim()}
              >
                <span className={styles.estimateLabel}>Estimated price</span>
                <strong className={styles.estimateValue}>{estimateTitle}</strong>
                <span className={styles.estimateCaption}>{estimateCaption}</span>
              </div>
            </div>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Message</span>
              <textarea
                name="message"
                onChange={handleChange}
                placeholder="Message"
                rows={5}
                value={form.message}
              />
            </label>

            <button className={styles.submit} type="submit">
              Send My Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

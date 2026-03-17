'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { ContactDetails } from '@/data/siteContent';
import styles from './ContactSection.module.css';

type ContactSectionProps = {
  details: ContactDetails;
};

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
  place: string;
  message: string;
};

const initialState: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  place: '',
  message: '',
};

export function ContactSection({ details }: ContactSectionProps) {
  const [form, setForm] = useState<ContactFormState>(initialState);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
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

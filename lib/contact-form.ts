import { contactDetails } from '@/data/siteContent';
import type { PublicCalcTier } from '@/lib/calc';

const SMTP2GO_API_BASE_URL = `${(process.env.SMTP2GO_API_BASE_URL || 'https://api.smtp2go.com/v3').replace(/\/+$/, '')}/`;
const SMTP2GO_SEND_EMAIL_URL = new URL('email/send', SMTP2GO_API_BASE_URL).toString();
const DEFAULT_CONTACT_RECIPIENT_EMAIL = contactDetails.email;

type SMTP2GOResponse = {
  error?: string;
  data?: {
    failed?: number;
    failures?: Array<{
      email?: string;
      error?: string;
    }>;
  };
};

export type ContactFormSubmission = {
  name: string;
  phone: string;
  email: string;
  place: string;
  height: number;
  width: number;
  message: string;
};

export type ContactEstimate = {
  area: number;
  estimatedPrice: number | null;
  matchedRate: number | null;
};

function getTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInteger(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function parseContactFormSubmission(body: unknown) {
  const source = typeof body === 'object' && body !== null ? body : {};
  const record = source as Record<string, unknown>;

  const submission: ContactFormSubmission = {
    name: getTrimmedString(record.name),
    phone: getTrimmedString(record.phone),
    email: getTrimmedString(record.email),
    place: getTrimmedString(record.place),
    height: parsePositiveInteger(record.height) ?? 0,
    width: parsePositiveInteger(record.width) ?? 0,
    message: getTrimmedString(record.message),
  };

  if (!submission.name) {
    return { error: 'Name is required.' as const };
  }

  if (!submission.phone) {
    return { error: 'Phone is required.' as const };
  }

  if (!submission.email || !isValidEmail(submission.email)) {
    return { error: 'A valid email is required.' as const };
  }

  if (!submission.place) {
    return { error: 'Place is required.' as const };
  }

  if (submission.width < 2 || submission.width > 25) {
    return { error: 'Width must be between 2 FT and 25 FT.' as const };
  }

  if (submission.height < 2 || submission.height > 17) {
    return { error: 'Height must be between 2 FT and 17 FT.' as const };
  }

  return { submission } as const;
}

export function getContactEstimate(
  submission: Pick<ContactFormSubmission, 'height' | 'width'>,
  calcTiers: PublicCalcTier[],
): ContactEstimate {
  const area = submission.height * submission.width;
  const matchingTier = calcTiers.find((tier) => area >= tier.minSqft && area < tier.maxSqft) ?? null;

  return {
    area,
    estimatedPrice: matchingTier ? area * matchingTier.pricePerSqft : null,
    matchedRate: matchingTier?.pricePerSqft ?? null,
  };
}

export async function sendContactFormEmail(
  submission: ContactFormSubmission,
  estimate: ContactEstimate,
) {
  const smtp2goApiKey = process.env.SMTP2GO_API_KEY?.trim();
  const recipientEmail = process.env.CONTACT_FORM_RECIPIENT_EMAIL?.trim() || DEFAULT_CONTACT_RECIPIENT_EMAIL;
  const senderEmail = process.env.SMTP2GO_SENDER_EMAIL?.trim() || DEFAULT_CONTACT_RECIPIENT_EMAIL;

  if (!smtp2goApiKey) {
    throw new Error('SMTP2GO_API_KEY is not configured.');
  }

  const safeName = escapeHtml(submission.name);
  const safePhone = escapeHtml(submission.phone);
  const safeEmail = escapeHtml(submission.email);
  const safePlace = escapeHtml(submission.place);
  const safeMessage = submission.message
    ? escapeHtml(submission.message).replace(/\r?\n/g, '<br />')
    : 'No message provided.';
  const estimateLabel =
    estimate.estimatedPrice !== null ? `$${estimate.estimatedPrice.toLocaleString('en-US')}` : 'Unavailable';
  const estimateDetails =
    estimate.matchedRate !== null ? `${estimate.area} sqft at $${estimate.matchedRate}/sqft` : `${estimate.area} sqft`;

  const payload = {
    sender: senderEmail,
    to: [recipientEmail],
    subject: `Quote request from ${submission.name}`,
    text_body: [
      'New quote request:',
      '',
      `Name: ${submission.name}`,
      `Phone: ${submission.phone}`,
      `Email: ${submission.email}`,
      `Place: ${submission.place}`,
      `Width: ${submission.width} FT`,
      `Height: ${submission.height} FT`,
      `Area: ${estimate.area} sqft`,
      `Estimated price: ${estimateLabel}`,
      estimate.matchedRate !== null ? `Rate: $${estimate.matchedRate}/sqft` : 'Rate: Unavailable',
      '',
      'Message:',
      submission.message || 'No message provided.',
    ].join('\n'),
    html_body: `
      <p>New quote request:</p>
      <ul>
        <li><strong>Name:</strong> ${safeName}</li>
        <li><strong>Phone:</strong> ${safePhone}</li>
        <li><strong>Email:</strong> ${safeEmail}</li>
        <li><strong>Place:</strong> ${safePlace}</li>
        <li><strong>Width:</strong> ${submission.width} FT</li>
        <li><strong>Height:</strong> ${submission.height} FT</li>
        <li><strong>Area:</strong> ${estimate.area} sqft</li>
        <li><strong>Estimated price:</strong> ${escapeHtml(estimateLabel)}</li>
        <li><strong>Estimate details:</strong> ${escapeHtml(estimateDetails)}</li>
      </ul>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `.trim(),
  };

  const response = await fetch(SMTP2GO_SEND_EMAIL_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': smtp2goApiKey,
    },
    body: JSON.stringify(payload),
  });

  let smtp2goResponse: SMTP2GOResponse | null = null;

  try {
    smtp2goResponse = (await response.json()) as SMTP2GOResponse;
  } catch {}

  const hasFailures = (smtp2goResponse?.data?.failed ?? 0) > 0;

  if (!response.ok || smtp2goResponse?.error || hasFailures) {
    console.error('SMTP2GO send error:', {
      status: response.status,
      statusText: response.statusText,
      response: smtp2goResponse,
    });

    throw new Error('Error sending email.');
  }
}

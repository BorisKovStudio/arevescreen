import { NextResponse } from 'next/server';
import { getCalcTiers } from '@/lib/calc';
import {
  getContactEstimate,
  parseContactFormSubmission,
  sendContactFormEmail,
} from '@/lib/contact-form';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsedSubmission = parseContactFormSubmission(body);

  if ('error' in parsedSubmission) {
    return NextResponse.json({ message: parsedSubmission.error }, { status: 400 });
  }

  try {
    const calcTiers = await getCalcTiers();
    const estimate = getContactEstimate(parsedSubmission.submission, calcTiers);

    await sendContactFormEmail(parsedSubmission.submission, estimate);

    return NextResponse.json(
      { message: 'Message sent successfully.' },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Contact form send failed:', error);

    return NextResponse.json(
      { message: 'Unable to send the message right now.' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

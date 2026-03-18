import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const currentUser = await getSessionUser();

  return NextResponse.json(
    {
      isAdmin: currentUser?.isAdmin === true,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { findUserByVerificationToken, updateUserById } from '@/lib/user-database';
import { updateUserInDB } from '@/lib/user-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body as { token: string };

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const user = findUserByVerificationToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Update in-memory
    updateUserById(user.id, {
      emailVerified: true,
      verificationToken: undefined,
      verificationSentAt: undefined,
    });

    // Persist to file DB
    try {
      updateUserInDB(user.id, {
        emailVerified: true,
        verificationToken: undefined,
        verificationSentAt: undefined,
      });
    } catch (err) {
      console.error('Failed to persist email verification to file DB:', err);
      // Continue - in-memory is updated
    }

    console.log('[EMAIL_VERIFY] Email verified for user:', user.email);

    return NextResponse.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

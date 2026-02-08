import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, updateUserById } from '@/lib/user-database';
import { updateUserInDB } from '@/lib/user-db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = findUserByUsername(email);
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Update in memory and persist to file
    updateUserById(user.id, {
      resetToken,
      resetTokenExpiresAt: expiresAt,
    });
    updateUserInDB(user.id, {
      resetToken,
      resetTokenExpiresAt: expiresAt,
    });

    const resetUrl = `${request.nextUrl.origin}/reset-password?token=${resetToken}`;
    const isDev = !process.env.SMTP_HOST;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.fullName},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    // In development mode, return the reset URL so it can be displayed
    return NextResponse.json({ 
      success: true,
      ...(isDev && { resetUrl, resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

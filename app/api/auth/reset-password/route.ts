import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByResetToken, updateUserById } from '@/lib/user-database';
import { updateUserInDB } from '@/lib/user-db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    const user = findUserByResetToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 410 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    // Update in memory and persist to file
    updateUserById(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    });
    const updatedUser = updateUserInDB(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    });
    
    console.log('✅ Password reset successful for user:', user.username);
    console.log('   New password hash saved to database');

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful',
        html: `
          <p>Hello ${user.fullName},</p>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          <p>If you did not make this change, please contact support immediately.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

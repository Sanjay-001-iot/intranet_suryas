import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserById } from '@/lib/user-database';

export async function GET() {
  const users = getAllUsers().map(({ passwordHash, verificationToken, resetToken, resetTokenExpiresAt, ...rest }) => rest);
  return NextResponse.json({ success: true, users });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body as { userId: string; updates: Record<string, any> };

    if (!userId || !updates) {
      return NextResponse.json({ error: 'userId and updates are required' }, { status: 400 });
    }

    const updated = updateUserById(userId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

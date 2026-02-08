import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByUsername, updateUser, findUserById } from '@/lib/user-database';
import { updateUserInDB, updateUserByUsernameInDB } from '@/lib/user-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentUsername,
      userId,
      updates,
      phone,
      profilePhoto,
      selectedRole,
      isProfileCompleted,
    } = body as {
      currentUsername?: string;
      userId?: string;
      updates?: any;
      phone?: string;
      profilePhoto?: string;
      selectedRole?: string;
      isProfileCompleted?: boolean;
    };

    // Handle profile setup completion (one-time setup)
    if (userId && isProfileCompleted) {
      const user = findUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updatePayload: any = {
        phone,
        profilePhoto,
        selectedRole,
        isProfileCompleted: true,
        profileCompletedAt: new Date().toISOString(),
      };

      // Update in memory and persist to file
      updateUser(user.username, updatePayload);
      const persisted = updateUserInDB(userId, updatePayload);
      
      if (!persisted) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }

      const { passwordHash, ...userWithoutPassword } = persisted;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }

    // Handle regular profile updates
    if (!currentUsername || !updates) {
      return NextResponse.json({ error: 'Missing update payload' }, { status: 400 });
    }

    const currentUser = findUserByUsername(currentUsername);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (updates.username && updates.username !== currentUser.username) {
      const existing = findUserByUsername(updates.username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    const updatePayload: any = { ...updates };

    if (updates.password) {
      updatePayload.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updatePayload.password;
    }

    // Update in memory and persist to file
    updateUser(currentUsername, updatePayload);
    const persisted = updateUserByUsernameInDB(currentUsername, updatePayload);

    if (!persisted) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const { passwordHash, ...userWithoutPassword } = persisted;

    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

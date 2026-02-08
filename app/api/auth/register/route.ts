import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByUsername, addUser, getAllUsers, StoredUser } from '@/lib/user-database';
import { saveUsersToDB } from '@/lib/user-db';
import { addNotificationDB } from '@/lib/notification-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, fullName, designation = '' } = body;

    // Validate inputs
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const role = 'user';
    const isPrivileged = false;

    // Explicitly type the status to narrow it from string to literal union
   const status: 'pending_approval' | 'active' | 'rejected' =
  isPrivileged ? 'active' : 'pending_approval';


    // Create new user with PENDING_APPROVAL status for non-privileged users
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      passwordHash,
      role: role as 'admin' | 'user' | 'guest' | 'founder',
      fullName,
      designation: designation || 'User',
      profilePictureUploaded: false,
      status,
      emailVerified: false, // Do NOT verify email on signup
      verificationToken: undefined, // No verification token yet (sent after admin approval)
      verificationSentAt: undefined,
      requestedAt: isPrivileged ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Save to in-memory DB
    const savedUser = addUser(newUser);

    // Persist to file DB
    saveUsersToDB(getAllUsers());

    // Notify admin and founder about new user access request
    const adminNotification = addNotificationDB({
      type: 'user_access_request',
      title: `New User Access Request - ${fullName}`,
      message: `${fullName} (${email}) has requested access. Click to review and approve/reject.`,
      targetUser: 'admin',
      relatedId: savedUser.id,
      read: false,
    });

    addNotificationDB({
      type: 'user_access_request',
      title: `New User Access Request - ${fullName}`,
      message: `${fullName} (${email}) has requested access. Click to review and approve/reject.`,
      targetUser: 'founder',
      relatedId: savedUser.id,
      read: false,
    });

    console.log(
      '[SIGNUP] New user created:',
      savedUser.username,
      'Status:',
      savedUser.status,
      'Admin notification created:',
      adminNotification.id
    );

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = savedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: isPrivileged
        ? 'User registered successfully'
        : 'Your access request has been submitted to the admin. You will receive an email once approved.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

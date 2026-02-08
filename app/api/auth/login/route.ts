import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByUsername } from '@/lib/user-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username or email
    const user = findUserByUsername(username);
    
    console.log('🔐 Login attempt for username:', username);
    console.log('   User found:', !!user);
    if (user) {
      console.log('   User ID:', user.id);
      console.log('   Stored email:', user.email);
      console.log('   Email verified:', user.emailVerified);
    }

    if (!user) {
      console.log('   ❌ Invalid username');
      return NextResponse.json(
        { error: 'Invalid username' },
        { status: 401 }
      );
    }

    // Check if user status is pending approval
    if (user.status === 'pending_approval') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval. Please wait for a confirmation email.' },
        { status: 403 }
      );
    }

    // Check if user was rejected
    if (user.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your access request has been rejected. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    console.log('   Password validation:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    if (!isPasswordValid) {
      console.log('   Attempted password hash comparison failed');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    console.log('   ✅ Login successful');

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

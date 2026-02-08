import { NextRequest, NextResponse } from 'next/server';
import {
  updateUserById,
  findUserById,
} from '@/lib/user-database';
import { updateUserInDB, loadUsersFromDB } from '@/lib/user-db';
import { sendEmail } from '@/lib/email';
import { addNotificationDB, markNotificationsByRelatedIdDB } from '@/lib/notification-db';

const ACCESS_APPROVER_EMAIL = 'administrator@suryas.in';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const usersFromDb = loadUsersFromDB();
    const pending = usersFromDb.filter(
      (user) => user.status === 'pending_approval'
    );
    console.log('[ACCESS-REQUESTS-GET] Pending users found:', pending.length);
    pending.forEach(u => console.log('  - User:', u.username, 'Status:', u.status));
    
    const requests = pending.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      requestedAt: user.requestedAt || user.createdAt,
    }));

    console.log('[ACCESS-REQUESTS-GET] Returning', requests.length, 'requests');

    let history: any[] = [];
    if (includeHistory) {
      history = usersFromDb
        .filter((user) =>
          !!user.requestedAt &&
          (user.status === 'active' || user.status === 'rejected')
        )
        .map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          requestedAt: user.requestedAt || user.createdAt,
          approvedAt: user.approvedAt,
          rejectedAt: user.rejectedAt,
        }))
        .sort((a, b) => {
          const aTime = new Date(a.approvedAt || a.rejectedAt || a.requestedAt).getTime();
          const bTime = new Date(b.approvedAt || b.rejectedAt || b.requestedAt).getTime();
          return bTime - aTime;
        });
    }

    return NextResponse.json({
      success: true,
      approver: ACCESS_APPROVER_EMAIL,
      requests,
      history,
    });
  } catch (error) {
    console.error('Access request fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    console.log('[ACCESS-REQUEST] Received:', { action, userId });

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Action and userId are required' },
        { status: 400 }
      );
    }

    const user = findUserById(userId);
    if (!user) {
      console.error('[ACCESS-REQUEST] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[ACCESS-REQUEST] Found user:', { id: user.id, username: user.username, status: user.status });

    if (action === 'deny') {
      // Update user status to rejected (do NOT delete)
      const updated = updateUserById(userId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });

      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to update user status' },
          { status: 500 }
        );
      }

      // Persist to file DB
      try {
        updateUserInDB(userId, {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to persist rejection to file DB:', err);
        // Continue anyway - user is updated in memory
      }

      // Send rejection email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Access Request Rejected',
          html: `
            <p>Hello ${user.fullName},</p>
            <p>Your account access request has been reviewed and rejected.</p>
            <p>If you have questions, please contact support.</p>
          `,
        });
      } catch (err) {
        console.error('Failed to send rejection email:', err);
        // Continue - rejection is already persisted
      }

      console.log('[ACCESS] User rejected:', userId, user.fullName);

      // Mark related access-request notifications as read
      markNotificationsByRelatedIdDB(userId, {
        type: 'user_access_request',
        targetUsers: ['admin', 'founder'],
      });

      // Notify admin and founder about rejection
      addNotificationDB({
        type: 'user_rejected',
        title: `User Rejected: ${user.fullName}`,
        message: `Access request for ${user.email} has been rejected.`,
        targetUser: 'admin',
        relatedId: userId,
        read: true,
      });

      addNotificationDB({
        type: 'user_rejected',
        title: `User Rejected: ${user.fullName}`,
        message: `Access request for ${user.email} has been rejected.`,
        targetUser: 'founder',
        relatedId: userId,
        read: true,
      });

      return NextResponse.json({
        success: true,
        message: 'User access request denied',
      });
    }

    if (action === 'approve') {
      // Update user to active status (no email verification)
      const updated = updateUserById(userId, {
        status: 'active',
        emailVerified: true,
        verificationToken: undefined,
        verificationSentAt: undefined,
        approvedAt: new Date().toISOString(),
      });

      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to approve user' },
          { status: 500 }
        );
      }

      // Persist to file DB
      try {
        updateUserInDB(userId, {
          status: 'active',
          emailVerified: true,
          verificationToken: undefined,
          verificationSentAt: undefined,
          approvedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to persist approval to file DB:', err);
        // Continue - user is updated in memory
      }

      console.log('[ACCESS] User approved:', userId, user.fullName);

      // Mark related access-request notifications as read
      markNotificationsByRelatedIdDB(userId, {
        type: 'user_access_request',
        targetUsers: ['admin', 'founder'],
      });

      // Notify admin and founder about approval
      addNotificationDB({
        type: 'user_approved',
        title: `User Approved: ${user.fullName}`,
        message: `Access approved for ${user.email}.`,
        targetUser: 'admin',
        relatedId: userId,
        read: true,
      });

      addNotificationDB({
        type: 'user_approved',
        title: `User Approved: ${user.fullName}`,
        message: `Access approved for ${user.email}.`,
        targetUser: 'founder',
        relatedId: userId,
        read: true,
      });

      return NextResponse.json({
        success: true,
        message: 'User access approved. User can log in immediately.',
        credentials: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use "approve" or "deny".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Access request error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

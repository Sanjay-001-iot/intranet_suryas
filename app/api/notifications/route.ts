import { NextRequest, NextResponse } from 'next/server';
import { 
  getNotificationsByTargetDB, 
  markAsReadDB, 
  markAllAsReadDB,
  addNotificationDB,
  readNotificationsDB 
} from '@/lib/notification-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUser = searchParams.get('targetUser');

    let notifications;
    if (targetUser) {
      // Get notifications for specific user or system notifications
      notifications = getNotificationsByTargetDB(targetUser);
    } else {
      // Get all notifications without filter
      notifications = readNotificationsDB();
    }

    return NextResponse.json({ 
      success: true,
      notifications 
    });
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, targetUser, relatedId } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const notification = addNotificationDB({
      type,
      title,
      message: message || '',
      targetUser: targetUser || 'all',
      relatedId,
      read: false,
    });

    console.log('[NOTIFICATION] Created:', notification.type, 'for', notification.targetUser);

    return NextResponse.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    console.error('Notification create error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAllAsRead, targetUser } = body;

    if (markAllAsRead && targetUser) {
      markAllAsReadDB(targetUser);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId) {
      const success = markAsReadDB(notificationId);
      if (!success) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json(
      { error: 'Either notificationId or markAllAsRead is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: String(error) },
      { status: 500 }
    );
  }
}

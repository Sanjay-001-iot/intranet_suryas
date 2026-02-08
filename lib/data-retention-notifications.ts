import fs from 'fs';
import path from 'path';

const NOTIFICATIONS_DB_FILE = path.join(process.cwd(), '.data', 'notifications.json');

export interface DataRetentionNotification {
  id: string;
  type: 'data-retention-warning' | 'data-retention-critical' | 'data-reset-complete';
  title: string;
  message: string;
  recipient: 'admin' | 'founder' | 'all';
  createdAt: string;
  read: boolean;
  excelDownloadUrl?: string;
  daysRemaining?: number;
}

function ensureNotificationsDir() {
  const dir = path.dirname(NOTIFICATIONS_DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readNotifications(): DataRetentionNotification[] {
  try {
    ensureNotificationsDir();
    if (!fs.existsSync(NOTIFICATIONS_DB_FILE)) {
      fs.writeFileSync(NOTIFICATIONS_DB_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(NOTIFICATIONS_DB_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
}

function writeNotifications(notifications: DataRetentionNotification[]) {
  try {
    ensureNotificationsDir();
    fs.writeFileSync(NOTIFICATIONS_DB_FILE, JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error('Error writing notifications:', error);
  }
}

export function createDataRetentionNotification(
  type: 'data-retention-warning' | 'data-retention-critical' | 'data-reset-complete',
  daysRemaining: number,
  recipient: 'admin' | 'founder' | 'all' = 'all'
): DataRetentionNotification {
  const notifications = readNotifications();
  
  let title = '';
  let message = '';
  
  switch (type) {
    case 'data-retention-warning':
      title = '⚠️ Data Backup Reminder - 1 Month Until Reset';
      message = `Important: Your approval request data will be reset in ${daysRemaining} days to manage storage. Please download all records as Excel for your records.`;
      break;
    case 'data-retention-critical':
      title = '🔴 Final Notice - Data Reset Imminent';
      message = `Critical: Your approval request data will be reset in ${daysRemaining} days. This is your final opportunity to download all records.`;
      break;
    case 'data-reset-complete':
      title = '✅ Data Reset Complete';
      message = 'All approval requests have been reset as per the data retention policy. You can now start fresh.';
      break;
  }
  
  const notification: DataRetentionNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    recipient,
    createdAt: new Date().toISOString(),
    read: false,
    daysRemaining,
  };
  
  notifications.push(notification);
  writeNotifications(notifications);
  
  return notification;
}

export function getDataRetentionNotifications(
  recipient: 'admin' | 'founder' | 'all'
): DataRetentionNotification[] {
  const notifications = readNotifications();
  
  if (recipient === 'all') {
    return notifications.filter((n) => n.type.includes('data-retention'));
  }
  
  return notifications.filter(
    (n) => n.type.includes('data-retention') && (n.recipient === recipient || n.recipient === 'all')
  );
}

export function markNotificationAsRead(notificationId: string): boolean {
  const notifications = readNotifications();
  const index = notifications.findIndex((n) => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    writeNotifications(notifications);
    return true;
  }
  
  return false;
}

export function getUnreadDataRetentionNotificationCount(recipient: 'admin' | 'founder'): number {
  const notifications = getDataRetentionNotifications(recipient);
  return notifications.filter((n) => !n.read).length;
}

export function deleteOldNotifications(olderThanDays: number = 90) {
  const notifications = readNotifications();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const filtered = notifications.filter((n) => {
    const notifDate = new Date(n.createdAt);
    return notifDate > cutoffDate || !n.type.includes('data-retention');
  });
  
  writeNotifications(filtered);
  return notifications.length - filtered.length;
}

import fs from 'fs';
import path from 'path';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  targetUser: string; // 'all' or specific user ID
  relatedId?: string;
  timestamp: string;
  read: boolean;
  userId?: string; // User who created the notification (e.g., admin approving)
}

const DB_PATH = path.join(process.cwd(), '.data', 'notifications.json');

function ensureDBDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readNotificationsDB(): Notification[] {
  ensureDBDir();
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Error reading notifications DB:', err);
    return [];
  }
}

export function writeNotificationsDB(notifications: Notification[]): void {
  ensureDBDir();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(notifications, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing notifications DB:', err);
  }
}

export function addNotificationDB(notification: Omit<Notification, 'id' | 'timestamp'>): Notification {
  const notifications = readNotificationsDB();
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  writeNotificationsDB(notifications);
  return newNotification;
}

export function getNotificationsByTargetDB(targetUser: string): Notification[] {
  const notifications = readNotificationsDB();
  return notifications.filter(
    (n) => n.targetUser === 'all' || n.targetUser === targetUser || !n.targetUser
  );
}

export function markAsReadDB(notificationId: string): boolean {
  const notifications = readNotificationsDB();
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    writeNotificationsDB(notifications);
    return true;
  }
  return false;
}

export function markAllAsReadDB(targetUser: string): void {
  const notifications = readNotificationsDB();
  const updated = notifications.map((n) => 
    (n.targetUser === targetUser || n.targetUser === 'all') ? { ...n, read: true } : n
  );
  writeNotificationsDB(updated);
}

export function markNotificationsByRelatedIdDB(
  relatedId: string,
  options?: { type?: string; targetUsers?: string[] }
): number {
  const notifications = readNotificationsDB();
  let updatedCount = 0;

  const updated = notifications.map((n) => {
    const matchRelated = n.relatedId === relatedId;
    const matchType = !options?.type || n.type === options.type;
    const matchTarget = !options?.targetUsers || options.targetUsers.includes(n.targetUser);

    if (matchRelated && matchType && matchTarget && !n.read) {
      updatedCount += 1;
      return { ...n, read: true };
    }
    return n;
  });

  if (updatedCount > 0) {
    writeNotificationsDB(updated);
  }

  return updatedCount;
}

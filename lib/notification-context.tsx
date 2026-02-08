"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Notification {
  id: string;
  type: 'guest_login' | 'recruitment' | 'inquiry' | 'leave' | 'project' | 'certificate' | 'workshop' | 'circular';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetUser?: string; // 'admin', 'founder', 'SanthanaKumar', 'hareesh', etc.
  relatedId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [targetUser, setTargetUser] = useState<string>('all');
  const { user } = useAuth();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = parsed?.role;
        if (role === 'admin' || role === 'founder') {
          setTargetUser(role);
        } else {
          setTargetUser(parsed?.username || role || 'all');
        }
      } catch (e) {
        console.error('Failed to parse current user:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin' || user.role === 'founder') {
      setTargetUser(user.role);
    } else {
      setTargetUser(user.username || user.role || 'all');
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?targetUser=${encodeURIComponent(targetUser)}`);
        if (!response.ok) return;
        const data = await response.json();
        if (active && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [targetUser]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true, targetUser }),
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }

    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/notification-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const visibleNotifications = notifications.filter((notif) => !notif.read);
  const router = useRouter();

  const handleNotificationClick = async (notif: { id: string; type?: string }) => {
    await markAsRead(notif.id);
    if (notif.type === 'user_access_request') {
      router.push('/admin-dashboard#access-requests');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500">
            No notifications
          </div>
        ) : (
          visibleNotifications.slice(0, 10).map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notif.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{notif.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatTimestamp(notif.timestamp)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 ml-2 mt-1"></div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        {visibleNotifications.length > 10 && (
          <div className="p-2 text-center">
            <span className="text-xs text-slate-500">
              +{visibleNotifications.length - 10} more notifications
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

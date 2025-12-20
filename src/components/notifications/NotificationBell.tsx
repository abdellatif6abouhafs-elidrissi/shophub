'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  CreditCard,
  Truck,
  AlertTriangle,
  Star,
  UserPlus,
  Tag,
  Settings,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  isAdmin?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  order_placed: <Package className="h-4 w-4 text-blue-500" />,
  order_confirmed: <Check className="h-4 w-4 text-green-500" />,
  order_shipped: <Truck className="h-4 w-4 text-purple-500" />,
  order_delivered: <CheckCheck className="h-4 w-4 text-green-600" />,
  order_cancelled: <X className="h-4 w-4 text-red-500" />,
  payment_received: <CreditCard className="h-4 w-4 text-green-500" />,
  payment_failed: <AlertTriangle className="h-4 w-4 text-red-500" />,
  low_stock: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  new_review: <Star className="h-4 w-4 text-yellow-500" />,
  new_user: <UserPlus className="h-4 w-4 text-blue-500" />,
  promo: <Tag className="h-4 w-4 text-pink-500" />,
  system: <Settings className="h-4 w-4 text-gray-500" />,
};

async function fetchNotifications(isAdmin: boolean) {
  const endpoint = isAdmin ? '/api/admin/notifications' : '/api/notifications';
  const res = await fetch(`${endpoint}?limit=10`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export default function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', isAdmin],
    queryFn: () => fetchNotifications(isAdmin),
    enabled: !!session,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const endpoint = isAdmin ? '/api/admin/notifications' : '/api/notifications';
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationIds ? { notificationIds } : { markAll: true }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', isAdmin] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId?: string) => {
      const endpoint = isAdmin ? '/api/admin/notifications' : '/api/notifications';
      const url = notificationId ? `${endpoint}?id=${notificationId}` : `${endpoint}?all=true`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', isAdmin] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) return null;

  const notifications: Notification[] = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate([notification._id]);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markReadMutation.mutate(undefined)}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => deleteMutation.mutate(undefined)}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    title="Clear all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`relative ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => handleNotificationClick(notification)}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <NotificationContent notification={notification} />
                        </Link>
                      ) : (
                        <div className="px-4 py-3">
                          <NotificationContent notification={notification} />
                        </div>
                      )}
                      {!notification.isRead && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <Link
                  href={isAdmin ? '/admin/notifications' : '/profile/notifications'}
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-lg py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {typeIcons[notification.type] || <Bell className="h-4 w-4 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

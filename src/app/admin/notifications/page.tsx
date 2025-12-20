'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
  Loader2,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Button from '@/components/ui/Button';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  order_placed: <Package className="h-5 w-5 text-blue-500" />,
  order_confirmed: <Check className="h-5 w-5 text-green-500" />,
  order_shipped: <Truck className="h-5 w-5 text-purple-500" />,
  order_delivered: <CheckCheck className="h-5 w-5 text-green-600" />,
  order_cancelled: <X className="h-5 w-5 text-red-500" />,
  payment_received: <CreditCard className="h-5 w-5 text-green-500" />,
  payment_failed: <AlertTriangle className="h-5 w-5 text-red-500" />,
  low_stock: <AlertTriangle className="h-5 w-5 text-orange-500" />,
  new_review: <Star className="h-5 w-5 text-yellow-500" />,
  new_user: <UserPlus className="h-5 w-5 text-blue-500" />,
  promo: <Tag className="h-5 w-5 text-pink-500" />,
  system: <Settings className="h-5 w-5 text-gray-500" />,
};

const typeLabels: Record<string, string> = {
  order_placed: 'New Orders',
  order_confirmed: 'Order Confirmed',
  order_shipped: 'Order Shipped',
  order_delivered: 'Order Delivered',
  order_cancelled: 'Order Cancelled',
  payment_received: 'Payment Received',
  payment_failed: 'Payment Failed',
  low_stock: 'Low Stock',
  new_review: 'New Reviews',
  new_user: 'New Users',
  promo: 'Promotions',
  system: 'System',
};

async function fetchNotifications(page: number, filter: string) {
  const params = new URLSearchParams({ page: page.toString(), limit: '20' });
  if (filter === 'unread') params.append('unread', 'true');
  const res = await fetch(`/api/admin/notifications?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', page, filter],
    queryFn: () => fetchNotifications(page, filter),
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationIds ? { notificationIds } : { markAll: true }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', true] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId?: string) => {
      const url = notificationId
        ? `/api/admin/notifications?id=${notificationId}`
        : '/api/admin/notifications?all=true';
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', true] });
    },
  });

  const notifications: Notification[] = data?.data || [];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markReadMutation.mutate(undefined)}
              disabled={markReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Delete all notifications?')) {
                  deleteMutation.mutate(undefined);
                }
              }}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:bg-red-50 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No notifications
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'unread' ? 'All notifications have been read' : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-start gap-4 p-4">
                  {!notification.isRead && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  <div className="flex-shrink-0 mt-1">
                    {typeIcons[notification.type] || <Bell className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            {typeLabels[notification.type] || notification.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => {
                              if (!notification.isRead) {
                                markReadMutation.mutate([notification._id]);
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            View
                          </Link>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markReadMutation.mutate([notification._id])}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(notification._id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

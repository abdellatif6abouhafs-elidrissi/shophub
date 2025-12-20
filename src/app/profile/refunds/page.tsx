'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  RefreshCcw,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/utils/format';

interface RefundRequest {
  _id: string;
  requestNumber: string;
  orderNumber: string;
  order: {
    _id: string;
    orderNumber: string;
  };
  items: Array<{
    name: string;
    refundQuantity: number;
  }>;
  reason: string;
  status: string;
  type: string;
  refundAmount: number;
  rejectionReason?: string;
  createdAt: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Approved' },
  processing: { icon: RefreshCcw, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Rejected' },
};

const reasonLabels: Record<string, string> = {
  defective: 'Product Defective',
  wrong_item: 'Wrong Item',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  damaged_shipping: 'Damaged in Shipping',
  other: 'Other',
};

async function fetchRefunds() {
  const res = await fetch('/api/refunds');
  if (!res.ok) throw new Error('Failed to fetch refunds');
  return res.json();
}

export default function UserRefundsPage() {
  const { status } = useSession();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-refunds'],
    queryFn: fetchRefunds,
    enabled: status === 'authenticated',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/refunds');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const refunds: RefundRequest[] = data?.refundRequests || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/profile" className="hover:text-gray-700 dark:hover:text-gray-300">
            Profile
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">Refund Requests</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Refund Requests
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Track the status of your refund and return requests
          </p>
        </div>

        {/* Refund Requests */}
        {refunds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm dark:bg-gray-900"
          >
            <Package className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No Refund Requests
            </h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              You haven&apos;t submitted any refund requests yet
            </p>
            <Link href="/profile/orders">
              <Button>View Orders</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {refunds.map((refund, index) => {
              const config = statusConfig[refund.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={refund._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900"
                >
                  <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {refund.requestNumber}
                          </h3>
                          <Badge variant="default" className="capitalize">
                            {refund.type}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Order: {refund.orderNumber} | {formatDate(refund.createdAt)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${config.bg}`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                        <ul className="mt-1 space-y-1">
                          {refund.items.map((item, i) => (
                            <li key={i} className="text-gray-900 dark:text-white">
                              {item.name} x{item.refundQuantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {reasonLabels[refund.reason]}
                        </p>
                      </div>
                    </div>

                    {refund.status === 'rejected' && refund.rejectionReason && (
                      <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Rejection Reason:
                        </p>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          {refund.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Refund Amount</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(refund.refundAmount)}
                        </p>
                      </div>
                      <Link href={`/profile/orders/${refund.order._id}`}>
                        <Button variant="outline" size="sm">
                          View Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  RefreshCcw,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

interface RefundRequest {
  _id: string;
  requestNumber: string;
  orderNumber: string;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    paymentMethod: string;
  };
  user?: {
    name: string;
    email: string;
  };
  guestEmail?: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
    refundQuantity: number;
  }>;
  reason: string;
  reasonDetails: string;
  status: string;
  type: string;
  refundAmount: number;
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: {
    name: string;
  };
  createdAt: string;
  processedAt?: string;
}

interface Stats {
  pending: { count: number; amount: number };
  approved: { count: number; amount: number };
  processing: { count: number; amount: number };
  completed: { count: number; amount: number };
  rejected: { count: number; amount: number };
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  approved: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  processing: { icon: RefreshCcw, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const reasonLabels: Record<string, string> = {
  defective: 'Product Defective',
  wrong_item: 'Wrong Item',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  damaged_shipping: 'Damaged in Shipping',
  other: 'Other',
};

async function fetchRefunds(params: Record<string, string>) {
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`/api/admin/refunds?${queryString}`);
  if (!res.ok) throw new Error('Failed to fetch refunds');
  return res.json();
}

async function updateRefund(id: string, data: { status: string; adminNotes?: string; rejectionReason?: string }) {
  const res = await fetch(`/api/refunds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update refund');
  }
  return res.json();
}

export default function AdminRefundsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | 'complete' | null; refund: RefundRequest | null }>({
    type: null,
    refund: null,
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-refunds', { status: statusFilter, type: typeFilter, search, page }],
    queryFn: () => fetchRefunds({
      status: statusFilter,
      type: typeFilter,
      search,
      page: page.toString(),
      limit: '10',
    }),
    enabled: authStatus === 'authenticated' && session?.user?.role === 'admin',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; adminNotes?: string; rejectionReason?: string } }) =>
      updateRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      toast.success('Refund request updated successfully');
      setActionModal({ type: null, refund: null });
      setAdminNotes('');
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  const refunds = data?.refundRequests || [];
  const stats: Stats = data?.stats || {
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    completed: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
  };
  const pagination = data?.pagination;

  const handleAction = (type: 'approve' | 'reject' | 'complete', refund: RefundRequest) => {
    setActionModal({ type, refund });
    setAdminNotes('');
    setRejectionReason('');
  };

  const confirmAction = () => {
    if (!actionModal.refund) return;

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      complete: 'completed',
    };

    updateMutation.mutate({
      id: actionModal.refund._id,
      data: {
        status: statusMap[actionModal.type!],
        adminNotes: adminNotes || undefined,
        rejectionReason: actionModal.type === 'reject' ? rejectionReason : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Refund Requests
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage customer refund and return requests
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(stats).map(([status, { count, amount }]) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 ${config.bg}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className={`font-medium capitalize ${config.color}`}>
                    {status}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPrice(amount)} total
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by request #, order #, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="refund">Refund</option>
              <option value="return">Return</option>
              <option value="exchange">Exchange</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Refunds Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="text-gray-600 dark:text-gray-400">Failed to load refund requests</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No refund requests found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Type/Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {refunds.map((refund: RefundRequest) => {
                    const config = statusConfig[refund.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={refund._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {refund.requestNumber}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Order: {refund.orderNumber}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="text-gray-900 dark:text-white">
                            {refund.user?.name || 'Guest'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {refund.user?.email || refund.guestEmail}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className="capitalize">
                            {refund.type}
                          </Badge>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {reasonLabels[refund.reason]}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatPrice(refund.refundAmount)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${config.bg}`}>
                            <StatusIcon className={`h-4 w-4 ${config.color}`} />
                            <span className={`text-sm font-medium capitalize ${config.color}`}>
                              {refund.status}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(refund.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedRefund(refund)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {refund.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAction('approve', refund)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleAction('reject', refund)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(refund.status === 'approved' || refund.status === 'processing') && (
                              <Button
                                size="sm"
                                onClick={() => handleAction('complete', refund)}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedRefund(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Refund Request Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Request #</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRefund.requestNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order #</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRefund.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRefund.user?.name || 'Guest'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedRefund.user?.email || selectedRefund.guestEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(selectedRefund.refundAmount)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {reasonLabels[selectedRefund.reason]}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Details</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedRefund.reasonDetails}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Items</p>
                <div className="space-y-2">
                  {selectedRefund.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.refundQuantity} of {item.quantity} @ {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.refundQuantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRefund.adminNotes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedRefund.adminNotes}
                  </p>
                </div>
              )}

              {selectedRefund.rejectionReason && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rejection Reason</p>
                  <p className="text-red-600 dark:text-red-400">
                    {selectedRefund.rejectionReason}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedRefund(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.type && actionModal.refund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActionModal({ type: null, refund: null })}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white capitalize">
              {actionModal.type} Refund Request
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {actionModal.type === 'approve' && 'Approve this refund request? The customer will be notified.'}
              {actionModal.type === 'reject' && 'Reject this refund request? Please provide a reason.'}
              {actionModal.type === 'complete' && 'Mark this refund as completed? This will update the order payment status.'}
            </p>

            {actionModal.type === 'reject' && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Explain why the request is being rejected..."
                />
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="Internal notes..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActionModal({ type: null, refund: null })}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={confirmAction}
                disabled={updateMutation.isPending || (actionModal.type === 'reject' && !rejectionReason)}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  user?: { name: string; email: string };
  isGuestOrder?: boolean;
  guestEmail?: string;
  guestName?: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    country: string;
  };
  createdAt: string;
}

async function fetchOrders(page: number, search: string, status: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  if (status) params.append('status', status);

  const res = await fetch(`/api/orders?${params}`);
  const data = await res.json();
  return data;
}

async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderStatus: status }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', page, search, status],
    queryFn: () => fetchOrders(page, search, status),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const orders = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Orders</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          Manage and track customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {orderStatuses.map((s) => {
          const config = statusConfig[s];
          const StatusIcon = config.icon;
          const count = orders.filter((o: Order) => o.orderStatus === s).length;

          return (
            <button
              key={s}
              onClick={() => {
                setStatus(status === s ? '' : s);
                setPage(1);
              }}
              className={`rounded-lg p-4 text-left transition-colors ${
                status === s
                  ? 'ring-2 ring-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${config.bg}`}
            >
              <StatusIcon className={`mb-2 h-5 w-5 ${config.color}`} />
              <p className={`text-lg font-bold ${config.color}`}>{count}</p>
              <p className="text-xs capitalize text-gray-600 dark:text-gray-400">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:flex-none sm:px-4"
            >
              <option value="">All Status</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Order
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Customer
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Items
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Total
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Status
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Payment
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Date
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 sm:w-24" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 sm:w-32" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 sm:w-16" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 sm:w-20" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700 sm:w-20" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-6 w-14 rounded bg-gray-200 dark:bg-gray-700 sm:w-16" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 sm:w-24" />
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                    <p className="mt-2 text-sm text-gray-400">
                      Orders will appear here once customers start purchasing
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order: Order, index: number) => {
                  const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6 sm:py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </p>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {order.isGuestOrder
                                ? order.guestName || order.shippingAddress?.fullName || 'Guest'
                                : order.user?.name || 'Unknown'}
                            </p>
                            {order.isGuestOrder && (
                              <span className="hidden items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:inline-flex">
                                Guest
                              </span>
                            )}
                          </div>
                          <p className="hidden truncate text-xs text-gray-500 dark:text-gray-400 sm:block sm:text-sm">
                            {order.isGuestOrder
                              ? order.guestEmail || 'N/A'
                              : order.user?.email || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-700 sm:h-8 sm:w-8"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="m-auto mt-1.5 h-3 w-3 text-gray-400 sm:mt-2 sm:h-4 sm:w-4" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-600 dark:text-gray-300 sm:h-8 sm:w-8">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6 sm:py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(order.total)}
                        </p>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 sm:gap-1.5 sm:px-3 ${statusInfo.bg}`}>
                          <StatusIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium capitalize ${statusInfo.color}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <Badge
                          size="sm"
                          variant={
                            order.paymentStatus === 'paid'
                              ? 'success'
                              : order.paymentStatus === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-6 sm:py-4">
                        <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 dark:border-gray-700 sm:flex-row sm:px-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, pagination.total)} of{' '}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                {page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-900"
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Customer</h4>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.user?.name || 'Guest'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedOrder.user?.email || 'N/A'}
                  </p>
                  {selectedOrder.shippingAddress && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400 m-auto mt-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>

              {/* Update Status */}
              <div>
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map((s) => {
                    const config = statusConfig[s];
                    const isActive = selectedOrder.orderStatus === s;

                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (!isActive) {
                            updateStatusMutation.mutate({ id: selectedOrder._id, status: s });
                          }
                        }}
                        disabled={isActive || updateStatusMutation.isPending}
                        className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                          isActive
                            ? `${config.bg} ${config.color} ring-2 ring-offset-2`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <Button variant="outline" className="w-full" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

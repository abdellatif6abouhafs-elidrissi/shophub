'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
  ArrowLeft,
  Copy,
  User,
  Mail,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

async function fetchOrder(id: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${id}`);
  const data = await res.json();
  return data.success ? data.data : null;
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
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

export default function AdminOrderDetailsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: sessionStatus === 'authenticated' && !!orderId,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: { orderStatus?: string; paymentStatus?: string; trackingNumber?: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order');
    },
  });

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied!');
    }
  };

  // Redirect non-admin users
  if (sessionStatus === 'authenticated' && session?.user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Order Not Found
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/admin/orders" className="hover:text-gray-700 dark:hover:text-gray-300">
            Orders
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">#{order.orderNumber}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.orderNumber}
              </h1>
              <button
                onClick={copyOrderNumber}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusInfo.bg}`}>
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              <span className={`font-medium capitalize ${statusInfo.color}`}>
                {order.orderStatus}
              </span>
            </div>
            <Badge
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
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Order Items ({order.items.length})
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Customer Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shipping Address
              </h2>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.phone}</p>
              <p className="mt-2">
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Order Summary & Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h2>
            </div>
            <p className="capitalize text-gray-600 dark:text-gray-400">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </p>
          </motion.div>

          {/* Update Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Update Order
            </h2>
            <div className="space-y-4">
              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Status
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateOrderMutation.mutate({ orderStatus: e.target.value })}
                  disabled={updateOrderMutation.isPending}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updateOrderMutation.mutate({ paymentStatus: e.target.value })}
                  disabled={updateOrderMutation.isPending}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber || order.trackingNumber || ''}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (trackingNumber) {
                        updateOrderMutation.mutate({ trackingNumber });
                      }
                    }}
                    disabled={!trackingNumber || updateOrderMutation.isPending}
                  >
                    {updateOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Notes */}
          {order.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Order Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

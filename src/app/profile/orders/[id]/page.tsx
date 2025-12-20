'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  RefreshCcw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import RefundRequestModal from '@/components/RefundRequestModal';
import { formatPrice, formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

interface OrderItem {
  product?: string;
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

const orderSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: status === 'authenticated' && !!orderId,
  });

  const handleRefundSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };

  const canRequestRefund = order &&
    ['delivered', 'shipped'].includes(order.orderStatus) &&
    order.paymentStatus !== 'refunded';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/orders');
    }
  }, [status, router]);

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied!');
    }
  };

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      toast.success('Tracking number copied!');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Order Not Found
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link href="/profile/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const currentStepIndex = orderSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button & Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/profile" className="hover:text-gray-700 dark:hover:text-gray-300">
              Profile
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/profile/orders" className="hover:text-gray-700 dark:hover:text-gray-300">
              Orders
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white">#{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </h1>
                <button
                  onClick={copyOrderNumber}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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

          {/* Order Progress */}
          {order.orderStatus !== 'cancelled' && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute left-0 top-4 h-1 w-full bg-gray-200 dark:bg-gray-700" />
                <div
                  className="absolute left-0 top-4 h-1 bg-blue-600 transition-all"
                  style={{
                    width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`,
                  }}
                />
                <div className="relative flex justify-between">
                  {orderSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                          } ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs capitalize ${
                            isCompleted
                              ? 'font-medium text-blue-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <Truck className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.trackingNumber}</p>
              </div>
              <button
                onClick={copyTrackingNumber}
                className="rounded p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Items ({order.items.length})
              </h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
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
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary & Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
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
                  <span>
                    {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                  </span>
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
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
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
            </div>

            {/* Payment Method */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment Method
                </h2>
              </div>
              <p className="capitalize text-gray-600 dark:text-gray-400">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
              </p>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Order Notes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {canRequestRefund && (
                <Button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Request Refund/Return
                </Button>
              )}
              <div className="flex gap-3">
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Need Help?
                  </Button>
                </Link>
                {['pending', 'confirmed'].includes(order.orderStatus) && (
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                    onClick={() => toast.error('Cancel functionality coming soon')}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Refund Request Modal */}
      {order && (
        <RefundRequestModal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          orderId={order._id}
          orderNumber={order.orderNumber}
          items={order.items}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Package, Loader2, ArrowLeft, CheckCircle, Clock, Truck, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatPrice } from '@/utils/format';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  total: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  trackingNumber?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/guest?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
        // Update URL with search params
        router.push(`/track-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || 'Order not found');
        setOrder(null);
      }
    } catch {
      setError('Failed to find order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Track Your Order
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your order number and email to check the status
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4 mb-8">
            <Input
              label="Order Number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="e.g. ORD-2412-ABC123"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email used for the order"
              required
            />
            <Button type="submit" className="w-full" isLoading={loading}>
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>

          {/* Error Message */}
          {error && searched && (
            <div className="mb-8 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-gray-200 pt-8 dark:border-gray-700"
            >
              {/* Order Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Status Bar */}
              {order.orderStatus !== 'cancelled' ? (
                <div className="mb-8">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${((currentStatusIndex + 1) / statusSteps.length) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Status Steps */}
                    <div className="relative flex justify-between">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                              } ${isCurrent ? 'ring-4 ring-green-200 dark:ring-green-900' : ''}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`mt-2 text-xs ${
                                isCompleted
                                  ? 'font-medium text-gray-900 dark:text-white'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-center font-medium text-red-600 dark:text-red-400">
                    This order has been cancelled
                  </p>
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Tracking Number</p>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    {order.trackingNumber}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(order.total)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
                Contact Support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackOrderContent />
    </Suspense>
  );
}

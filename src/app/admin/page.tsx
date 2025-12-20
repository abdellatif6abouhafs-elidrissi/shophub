'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Star,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatDate } from '@/utils/format';
import Badge from '@/components/ui/Badge';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  trends: {
    revenue: number;
    orders: number;
    users: number;
    products: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    image: string;
    ratings: { average: number; count: number };
  }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ _id: string; revenue: number; orders: number }>;
}

async function fetchDashboardStats(): Promise<DashboardData> {
  const res = await fetch('/api/admin/stats');
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  processing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  shipped: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      trend: stats?.trends.revenue || 0,
      format: 'currency',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      trend: stats?.trends.orders || 0,
      format: 'number',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      trend: stats?.trends.users || 0,
      format: 'number',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      trend: stats?.trends.products || 0,
      format: 'number',
    },
  ];

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Failed to load dashboard data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              {stat.trend !== 0 && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    stat.trend > 0
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(stat.trend)}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : stat.format === 'currency' ? (
                  formatPrice(stat.value)
                ) : (
                  stat.value.toLocaleString()
                )}
              </p>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gray-100 opacity-50 dark:bg-gray-800" />
          </motion.div>
        ))}
      </div>

      {/* Order Status Overview */}
      {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Orders by Status
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = stats.ordersByStatus[status] || 0;
              const StatusIcon = config.icon;
              return (
                <Link
                  key={status}
                  href={`/admin/orders?status=${status}`}
                  className={`rounded-lg p-4 text-center transition-all hover:scale-105 ${config.bg}`}
                >
                  <StatusIcon className={`mx-auto mb-2 h-6 w-6 ${config.color}`} />
                  <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                  <p className="text-xs capitalize text-gray-600 dark:text-gray-400">
                    {status}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-1">
              {stats.recentOrders.map((order, index) => {
                const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;
                return (
                  <Link
                    key={order._id}
                    href="/admin/orders"
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${statusInfo.bg}`}>
                        <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user?.name || 'Guest'} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(order.total)}
                      </p>
                      <Badge
                        variant={
                          order.paymentStatus === 'paid'
                            ? 'success'
                            : order.paymentStatus === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No orders yet. They will appear here once customers start ordering.
              </p>
            </div>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Products
            </h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="space-y-1">
              {stats.topProducts.map((product, index) => (
                <Link
                  key={product._id}
                  href="/admin/products"
                  className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="m-auto mt-3 h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.ratings.average.toFixed(1)}
                      </div>
                      <span>•</span>
                      <span>{product.stock} in stock</span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No products yet. Add some products to see them here.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/admin/products"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
          >
            <div className="rounded-xl bg-blue-100 p-3 transition-transform group-hover:scale-110 dark:bg-blue-900/30">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add Product
            </span>
          </Link>
          <Link
            href="/admin/categories"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:border-green-400 dark:hover:bg-green-900/20"
          >
            <div className="rounded-xl bg-green-100 p-3 transition-transform group-hover:scale-110 dark:bg-green-900/30">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Categories
            </span>
          </Link>
          <Link
            href="/admin/orders"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-purple-500 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
          >
            <div className="rounded-xl bg-purple-100 p-3 transition-transform group-hover:scale-110 dark:bg-purple-900/30">
              <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              View Orders
            </span>
          </Link>
          <Link
            href="/admin/users"
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-400 dark:hover:bg-orange-900/20"
          >
            <div className="rounded-xl bg-orange-100 p-3 transition-transform group-hover:scale-110 dark:bg-orange-900/30">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Manage Users
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

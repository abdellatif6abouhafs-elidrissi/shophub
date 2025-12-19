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
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/utils/format';
import Badge from '@/components/ui/Badge';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    ratings: { average: number; count: number };
  }>;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  // In production, you would fetch this from an API
  // For now, return mock data
  return {
    totalRevenue: 54289.99,
    totalOrders: 156,
    totalUsers: 1234,
    totalProducts: 89,
    recentOrders: [],
    topProducts: [],
  };
}

const statCards = [
  {
    title: 'Total Revenue',
    icon: DollarSign,
    color: 'bg-green-500',
    trend: 12.5,
    format: 'currency',
  },
  {
    title: 'Total Orders',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    trend: 8.2,
    format: 'number',
  },
  {
    title: 'Total Users',
    icon: Users,
    color: 'bg-purple-500',
    trend: 15.3,
    format: 'number',
  },
  {
    title: 'Total Products',
    icon: Package,
    color: 'bg-orange-500',
    trend: -2.4,
    format: 'number',
  },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const getStatValue = (index: number) => {
    if (!stats) return 0;
    switch (index) {
      case 0:
        return stats.totalRevenue;
      case 1:
        return stats.totalOrders;
      case 2:
        return stats.totalUsers;
      case 3:
        return stats.totalProducts;
      default:
        return 0;
    }
  };

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
            className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {stat.trend > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(stat.trend)}%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading
                  ? '...'
                  : stat.format === 'currency'
                  ? formatPrice(getStatValue(index))
                  : getStatValue(index).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.user.name} &bull; {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(order.total)}
                    </p>
                    <Badge
                      variant={
                        order.orderStatus === 'delivered'
                          ? 'success'
                          : order.orderStatus === 'cancelled'
                          ? 'danger'
                          : 'info'
                      }
                      size="sm"
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No orders yet. They will appear here once customers start ordering.
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Products
            </h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.ratings.count} reviews &bull;{' '}
                      {product.stock} in stock
                    </p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No products yet. Add some products to see them here.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/admin/products/new"
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add Product
            </span>
          </Link>
          <Link
            href="/admin/categories/new"
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add Category
            </span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <ShoppingCart className="h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              View Orders
            </span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            <Users className="h-8 w-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Manage Users
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

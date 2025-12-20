'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  PieChart,
  Loader2,
  Calendar,
} from 'lucide-react';

interface AnalyticsData {
  period: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  ordersByDay: Array<{ date: string; count: number }>;
  topProducts: Array<{ id: string; name: string; totalSold: number; revenue: number }>;
  topCategories: Array<{ id: string; name: string; totalSold: number; revenue: number }>;
  customerGrowth: Array<{ date: string; count: number }>;
  orderStatusDistribution: Record<string, number>;
  paymentStatusDistribution: Record<string, number>;
  orderStats: { avgValue: number; maxValue: number; minValue: number };
  revenueByPaymentMethod: Array<{ method: string; revenue: number; count: number }>;
  totals: { revenue: number; orders: number; customers: number; products: number };
}

async function fetchAnalytics(period: string): Promise<{ success: boolean; data: AnalyticsData }> {
  const res = await fetch(`/api/admin/analytics?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => fetchAnalytics(period),
    refetchInterval: 60000,
  });

  const analytics = data?.data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
      paid: 'bg-green-500',
      unpaid: 'bg-yellow-500',
      refunded: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load analytics</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your store performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : analytics ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(analytics.totals.revenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/30">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totals.orders)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totals.customers)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(analytics.totals.products)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                  <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Value Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Order Value</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.orderStats.avgValue)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Order</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.orderStats.maxValue)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lowest Order</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.orderStats.minValue)}
              </p>
            </motion.div>
          </div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
            </div>
            <div className="h-64">
              {analytics.revenueByDay.length > 0 ? (
                <div className="flex items-end justify-between h-full gap-1">
                  {analytics.revenueByDay.slice(-14).map((day, index) => {
                    const maxRevenue = Math.max(...analytics.revenueByDay.map((d) => d.revenue));
                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="relative w-full flex justify-center group">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 2)}%` }}
                            transition={{ delay: index * 0.05 }}
                            className="w-full max-w-8 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                            style={{ minHeight: '4px' }}
                          />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatCurrency(day.revenue)}
                            <br />
                            {day.orders} orders
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 -rotate-45 origin-top-left">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No revenue data for this period
                </div>
              )}
            </div>
          </motion.div>

          {/* Status Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => {
                  const total = Object.values(analytics.orderStatusDistribution).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{status}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full ${getStatusColor(status)} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(analytics.orderStatusDistribution).length === 0 && (
                  <p className="text-gray-400 text-center py-4">No orders in this period</p>
                )}
              </div>
            </motion.div>

            {/* Payment Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Status</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(analytics.paymentStatusDistribution).map(([status, count]) => {
                  const total = Object.values(analytics.paymentStatusDistribution).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-600 dark:text-gray-400">{status}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full ${getStatusColor(status)} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(analytics.paymentStatusDistribution).length === 0 && (
                  <p className="text-gray-400 text-center py-4">No payments in this period</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Top Products & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <Package className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
              </div>
              <div className="space-y-4">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.totalSold} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.topProducts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No sales in this period</p>
                )}
              </div>
            </motion.div>

            {/* Top Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h2>
              </div>
              <div className="space-y-4">
                {analytics.topCategories.slice(0, 5).map((category, index) => (
                  <div key={category.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.totalSold} items sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(category.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.topCategories.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No category data</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.revenueByPaymentMethod.map((method) => (
                <div
                  key={method.method}
                  className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700"
                >
                  <p className="text-sm text-gray-500 capitalize mb-1 dark:text-gray-400">
                    {method.method.replace('_', ' ')}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(method.revenue)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {method.count} transactions
                  </p>
                </div>
              ))}
              {analytics.revenueByPaymentMethod.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-4">
                  No payment data
                </p>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

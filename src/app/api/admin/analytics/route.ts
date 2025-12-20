import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const daysAgo = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all analytics data in parallel
    const [
      // Revenue over time
      revenueByDay,
      // Orders over time
      ordersByDay,
      // Top selling products
      topProducts,
      // Top categories
      topCategories,
      // Customer growth
      customerGrowth,
      // Order status distribution
      orderStatusDist,
      // Payment status distribution
      paymentStatusDist,
      // Average order value
      avgOrderValue,
      // Revenue by payment method
      revenueByPaymentMethod,
      // Total stats
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    ] = await Promise.all([
      // Revenue by day
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Orders by day (all statuses)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top selling products
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid',
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      // Top categories
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid',
          },
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'productInfo.category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$categoryInfo._id',
            name: { $first: '$categoryInfo.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),

      // Customer growth
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Order status distribution
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // Payment status distribution
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // Average order value
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            avgValue: { $avg: '$total' },
            maxValue: { $max: '$total' },
            minValue: { $min: '$total' },
          },
        },
      ]),

      // Revenue by payment method
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            revenue: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Total revenue (all time)
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),

      // Total orders
      Order.countDocuments(),

      // Total customers
      User.countDocuments({ role: 'user' }),

      // Total products
      Product.countDocuments(),
    ]);

    // Format data for response
    const formatDistribution = (data: Array<{ _id: string; count: number }>) => {
      const result: Record<string, number> = {};
      data.forEach((item) => {
        result[item._id || 'unknown'] = item.count;
      });
      return result;
    };

    return NextResponse.json({
      success: true,
      data: {
        period: daysAgo,
        revenueByDay: revenueByDay.map((d) => ({
          date: d._id,
          revenue: d.revenue,
          orders: d.orders,
        })),
        ordersByDay: ordersByDay.map((d) => ({
          date: d._id,
          count: d.count,
        })),
        topProducts: topProducts.map((p) => ({
          id: p._id,
          name: p.name || 'Unknown Product',
          totalSold: p.totalSold,
          revenue: p.revenue,
        })),
        topCategories: topCategories.map((c) => ({
          id: c._id,
          name: c.name || 'Unknown Category',
          totalSold: c.totalSold,
          revenue: c.revenue,
        })),
        customerGrowth: customerGrowth.map((c) => ({
          date: c._id,
          count: c.count,
        })),
        orderStatusDistribution: formatDistribution(orderStatusDist),
        paymentStatusDistribution: formatDistribution(paymentStatusDist),
        orderStats: {
          avgValue: avgOrderValue[0]?.avgValue || 0,
          maxValue: avgOrderValue[0]?.maxValue || 0,
          minValue: avgOrderValue[0]?.minValue || 0,
        },
        revenueByPaymentMethod: revenueByPaymentMethod.map((p) => ({
          method: p._id || 'unknown',
          revenue: p.revenue,
          count: p.count,
        })),
        totals: {
          revenue: totalRevenue[0]?.total || 0,
          orders: totalOrders,
          customers: totalCustomers,
          products: totalProducts,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

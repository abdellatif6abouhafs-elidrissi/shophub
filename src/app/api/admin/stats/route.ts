import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get current date info for trends
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all stats in parallel
    const [
      // Total revenue (all time)
      totalRevenueResult,
      // This month revenue
      thisMonthRevenueResult,
      // Last month revenue
      lastMonthRevenueResult,
      // Total orders
      totalOrders,
      // This month orders
      thisMonthOrders,
      // Last month orders
      lastMonthOrders,
      // Total users
      totalUsers,
      // This month users
      thisMonthUsers,
      // Last month users
      lastMonthUsers,
      // Total products
      totalProducts,
      // Recent orders
      recentOrders,
      // Top products (by rating)
      topProducts,
      // Orders by status
      ordersByStatus,
      // Revenue by day (last 7 days)
      revenueByDay,
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      // This month revenue
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      // Last month revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      // Total orders
      Order.countDocuments(),
      // This month orders
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Last month orders
      Order.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      // Total users
      User.countDocuments(),
      // This month users
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Last month users
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      // Total products
      Product.countDocuments(),
      // Recent orders (last 5)
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Top products (by rating average, limit 5)
      Product.find()
        .sort({ 'ratings.average': -1, 'ratings.count': -1 })
        .limit(5)
        .select('name price stock images ratings')
        .lean(),
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      // Revenue by day (last 7 days)
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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
    ]);

    // Calculate trends
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    const revenueTrend = lastMonthRevenue
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    const ordersTrend = lastMonthOrders
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : thisMonthOrders > 0 ? 100 : 0;

    const usersTrend = lastMonthUsers
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
      : thisMonthUsers > 0 ? 100 : 0;

    // Format orders by status
    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((item: { _id: string; count: number }) => {
      statusCounts[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        trends: {
          revenue: Math.round(revenueTrend * 10) / 10,
          orders: Math.round(ordersTrend * 10) / 10,
          users: Math.round(usersTrend * 10) / 10,
          products: 0, // Products don't have a trend calculation
        },
        recentOrders: recentOrders.map((order: any) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          user: order.user || { name: 'Guest', email: 'N/A' },
        })),
        topProducts: topProducts.map((product: any) => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.images?.[0] || '',
          ratings: product.ratings || { average: 0, count: 0 },
        })),
        ordersByStatus: statusCounts,
        revenueByDay,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

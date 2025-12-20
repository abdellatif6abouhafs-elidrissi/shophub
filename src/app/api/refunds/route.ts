import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import RefundRequest from '@/models/RefundRequest';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendRefundRequestEmail } from '@/lib/email';

// Create a new refund request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      orderId,
      items,
      reason,
      reasonDetails,
      type,
      refundMethod,
      guestEmail,
      images,
    } = body;

    if (!orderId || !items || !reason || !reasonDetails || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session) {
      if (order.user?.toString() !== session.user.id && !order.isGuestOrder) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (order.isGuestOrder) {
      if (!guestEmail || order.guestEmail !== guestEmail) {
        return NextResponse.json(
          { error: 'Please provide the email used for this order' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Please login to request a refund' },
        { status: 401 }
      );
    }

    // Check if order is eligible for refund
    if (order.orderStatus === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot request refund for cancelled orders' },
        { status: 400 }
      );
    }

    if (order.paymentStatus === 'refunded') {
      return NextResponse.json(
        { error: 'This order has already been refunded' },
        { status: 400 }
      );
    }

    // Check if there's already a pending refund request
    const existingRequest = await RefundRequest.findOne({
      order: orderId,
      status: { $in: ['pending', 'approved', 'processing'] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'There is already a pending refund request for this order' },
        { status: 400 }
      );
    }

    // Validate items and calculate refund amount
    let refundAmount = 0;
    const refundItems = [];

    for (const item of items) {
      const orderItem = order.items.find(
        (oi: { product: { toString: () => string }; quantity: number; price: number; name: string; image: string }) =>
          oi.product.toString() === item.productId
      );

      if (!orderItem) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found in order` },
          { status: 400 }
        );
      }

      if (item.quantity > orderItem.quantity) {
        return NextResponse.json(
          { error: `Cannot refund more than ordered quantity for ${orderItem.name}` },
          { status: 400 }
        );
      }

      refundAmount += orderItem.price * item.quantity;
      refundItems.push({
        product: orderItem.product,
        name: orderItem.name,
        image: orderItem.image,
        price: orderItem.price,
        quantity: orderItem.quantity,
        refundQuantity: item.quantity,
      });
    }

    // Create refund request
    const refundRequest = await RefundRequest.create({
      order: orderId,
      orderNumber: order.orderNumber,
      user: session?.user?.id || undefined,
      guestEmail: order.isGuestOrder ? order.guestEmail : undefined,
      items: refundItems,
      reason,
      reasonDetails,
      type,
      refundAmount,
      refundMethod: refundMethod || 'original_payment',
      images: images || [],
    });

    // Send confirmation email
    try {
      let customerEmail = order.isGuestOrder ? order.guestEmail : '';
      let customerName = order.isGuestOrder ? order.guestName : '';

      if (session?.user?.id) {
        const user = await User.findById(session.user.id);
        if (user) {
          customerEmail = user.email;
          customerName = user.name;
        }
      }

      if (customerEmail) {
        await sendRefundRequestEmail(
          customerEmail,
          customerName || 'Customer',
          refundRequest.requestNumber,
          order.orderNumber,
          refundAmount,
          refundItems.map((item: { name: string; refundQuantity: number }) => ({
            name: item.name,
            quantity: item.refundQuantity,
          }))
        );
      }
    } catch (emailError) {
      console.error('Failed to send refund request email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully',
      refundRequest: {
        id: refundRequest._id,
        requestNumber: refundRequest.requestNumber,
        status: refundRequest.status,
        refundAmount: refundRequest.refundAmount,
      },
    });
  } catch (error) {
    console.error('Error creating refund request:', error);
    return NextResponse.json(
      { error: 'Failed to create refund request' },
      { status: 500 }
    );
  }
}

// Get user's refund requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const guestEmail = searchParams.get('guestEmail');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    let query: Record<string, unknown> = {};

    if (session) {
      query.user = session.user.id;
    } else if (guestEmail) {
      query.guestEmail = guestEmail;
    } else {
      return NextResponse.json(
        { error: 'Please login or provide guest email' },
        { status: 401 }
      );
    }

    const skip = (page - 1) * limit;

    const [refundRequests, total] = await Promise.all([
      RefundRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('order', 'orderNumber orderStatus total')
        .lean(),
      RefundRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      refundRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refund requests' },
      { status: 500 }
    );
  }
}

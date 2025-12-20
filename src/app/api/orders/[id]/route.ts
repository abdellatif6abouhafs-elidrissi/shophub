import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOrderStatusEmail } from '@/lib/email';
import { notifyOrderStatusChange } from '@/lib/notifications';
import { z } from 'zod';

// GET - Fetch single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const order = await Order.findById(id).populate('user', 'name email').lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the order or is admin
    const orderUserId = (order.user as any)?._id?.toString() || order.user?.toString();
    if (
      session.user.role !== 'admin' &&
      orderUserId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT - Update order status (admin only)
const updateOrderSchema = z.object({
  orderStatus: z
    .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  trackingNumber: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validation = updateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = { ...validation.data };

    // Set timestamps based on status
    if (validation.data.orderStatus === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (validation.data.orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send email notification for status updates
    if (validation.data.orderStatus) {
      const user = order.user as unknown as { _id: string; name: string; email: string };
      await sendOrderStatusEmail(
        user.email,
        user.name,
        order.orderNumber,
        validation.data.orderStatus,
        order.trackingNumber
      );

      // Send in-app notification to user
      try {
        await notifyOrderStatusChange(
          user._id.toString(),
          order._id.toString(),
          order.orderNumber,
          validation.data.orderStatus
        );
      } catch (notifyError) {
        console.error('Failed to send status notification:', notifyError);
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (
      session.user.role !== 'admin' &&
      order.user.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Can only cancel pending orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel order at this stage' },
        { status: 400 }
      );
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Send cancellation email and notification
    const user = await User.findById(order.user);
    if (user) {
      await sendOrderStatusEmail(
        user.email,
        user.name,
        order.orderNumber,
        'cancelled'
      );

      // Send in-app notification
      try {
        await notifyOrderStatusChange(
          user._id.toString(),
          order._id.toString(),
          order.orderNumber,
          'cancelled'
        );
      } catch (notifyError) {
        console.error('Failed to send cancellation notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

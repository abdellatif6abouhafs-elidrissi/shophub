import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

// GET - Fetch guest order by order number and email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find guest order by order number and guest email
    const order = await Order.findOne({
      orderNumber: orderNumber.toUpperCase(),
      guestEmail: email.toLowerCase(),
      isGuestOrder: true,
    }).select('-__v');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found. Please check your order number and email.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Guest order lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AbandonedCart from '@/models/AbandonedCart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Save/Update abandoned cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, items, totalAmount } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email and items are required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check if there's an existing abandoned cart for this email
    let abandonedCart = await AbandonedCart.findOne({
      email,
      isRecovered: false,
    });

    if (abandonedCart) {
      // Update existing cart
      abandonedCart.items = items;
      abandonedCart.totalAmount = totalAmount;
      if (userId) abandonedCart.user = userId as any;
      await abandonedCart.save();
    } else {
      // Create new abandoned cart
      abandonedCart = await AbandonedCart.create({
        user: userId,
        email,
        items,
        totalAmount,
      });
    }

    return NextResponse.json({
      success: true,
      data: abandonedCart,
    });
  } catch (error) {
    console.error('Abandoned cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save abandoned cart' },
      { status: 500 }
    );
  }
}

// DELETE - Mark cart as recovered (when user completes checkout)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Mark cart as recovered
    await AbandonedCart.updateMany(
      { email, isRecovered: false },
      { isRecovered: true, recoveredAt: new Date() }
    );

    return NextResponse.json({
      success: true,
      message: 'Cart marked as recovered',
    });
  } catch (error) {
    console.error('Abandoned cart recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to recover cart' },
      { status: 500 }
    );
  }
}

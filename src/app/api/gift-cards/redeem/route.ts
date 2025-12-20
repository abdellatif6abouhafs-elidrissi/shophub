import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GiftCard from '@/models/GiftCard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Redeem gift card (apply to order)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { code, amount, orderId } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Gift card code is required' },
        { status: 400 }
      );
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return NextResponse.json(
        { success: false, error: 'Gift card not found' },
        { status: 404 }
      );
    }

    // Check if valid
    if (!giftCard.isActive) {
      return NextResponse.json(
        { success: false, error: 'This gift card has been deactivated' },
        { status: 400 }
      );
    }

    if (giftCard.currentBalance <= 0) {
      return NextResponse.json(
        { success: false, error: 'This gift card has no remaining balance' },
        { status: 400 }
      );
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This gift card has expired' },
        { status: 400 }
      );
    }

    // Calculate amount to use
    const amountToUse = amount
      ? Math.min(amount, giftCard.currentBalance)
      : giftCard.currentBalance;

    // Record the user who redeemed if logged in
    if (session?.user?.id && !giftCard.redeemedBy) {
      giftCard.redeemedBy = session.user.id as any;
    }

    // Deduct balance
    giftCard.currentBalance -= amountToUse;

    // Add transaction
    giftCard.transactions.push({
      type: 'redemption',
      amount: -amountToUse,
      orderId: orderId || undefined,
      date: new Date(),
    });

    await giftCard.save();

    return NextResponse.json({
      success: true,
      data: {
        amountUsed: amountToUse,
        remainingBalance: giftCard.currentBalance,
        code: giftCard.code,
      },
    });
  } catch (error) {
    console.error('Gift card redemption error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem gift card' },
      { status: 500 }
    );
  }
}

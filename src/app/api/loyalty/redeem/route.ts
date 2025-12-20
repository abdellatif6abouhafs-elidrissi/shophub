import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LoyaltyPoints, { LOYALTY_RULES } from '@/models/LoyaltyPoints';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Redeem points for discount
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { points, orderId } = body;

    if (!points || points < LOYALTY_RULES.minRedemption) {
      return NextResponse.json(
        { success: false, error: `Minimum redemption is ${LOYALTY_RULES.minRedemption} points` },
        { status: 400 }
      );
    }

    const loyaltyAccount = await LoyaltyPoints.findOne({ user: session.user.id });

    if (!loyaltyAccount) {
      return NextResponse.json(
        { success: false, error: 'Loyalty account not found' },
        { status: 404 }
      );
    }

    if (points > loyaltyAccount.availablePoints) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Calculate dollar value
    const dollarValue = points / LOYALTY_RULES.pointsPerDollarRedemption;

    // Add redemption transaction
    loyaltyAccount.transactions.push({
      type: 'redeemed',
      points: -points,
      description: `Redeemed ${points} points for $${dollarValue.toFixed(2)} discount`,
      orderId: orderId || undefined,
      createdAt: new Date(),
    });

    // Update available points
    loyaltyAccount.availablePoints -= points;

    await loyaltyAccount.save();

    return NextResponse.json({
      success: true,
      data: {
        pointsRedeemed: points,
        dollarValue,
        remainingPoints: loyaltyAccount.availablePoints,
      },
    });
  } catch (error) {
    console.error('Points redemption error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem points' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LoyaltyPoints, { LOYALTY_RULES } from '@/models/LoyaltyPoints';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Earn points (internal use for orders, reviews, etc.)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, type, amount, orderId, description } = body;

    // Validate request (could add API key validation for internal use)
    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: 'User ID and type are required' },
        { status: 400 }
      );
    }

    let loyaltyAccount = await LoyaltyPoints.findOne({ user: userId });

    // Create account if doesn't exist
    if (!loyaltyAccount) {
      loyaltyAccount = await LoyaltyPoints.create({
        user: userId,
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        tier: 'bronze',
        transactions: [],
      });
    }

    let pointsToAdd = 0;
    let transactionDescription = description || '';

    const tierInfo = LOYALTY_RULES.tiers[loyaltyAccount.tier as keyof typeof LOYALTY_RULES.tiers];
    const multiplier = tierInfo.multiplier;

    switch (type) {
      case 'order':
        // Points for purchase
        pointsToAdd = Math.floor(amount * LOYALTY_RULES.pointsPerDollar * multiplier);
        transactionDescription = transactionDescription || `Earned from order`;
        break;

      case 'review':
        pointsToAdd = LOYALTY_RULES.bonuses.review;
        transactionDescription = transactionDescription || 'Bonus for writing a review';
        break;

      case 'referral':
        pointsToAdd = LOYALTY_RULES.bonuses.referral;
        transactionDescription = transactionDescription || 'Referral bonus';
        break;

      case 'birthday':
        pointsToAdd = LOYALTY_RULES.bonuses.birthday;
        transactionDescription = transactionDescription || 'Birthday bonus! 🎂';
        break;

      case 'bonus':
        pointsToAdd = amount || 0;
        transactionDescription = transactionDescription || 'Bonus points';
        break;

      case 'refund':
        // Return points for refunded order
        pointsToAdd = amount || 0;
        transactionDescription = transactionDescription || 'Points refunded';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid point type' },
          { status: 400 }
        );
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + LOYALTY_RULES.expirationDays);

    // Add transaction
    loyaltyAccount.transactions.push({
      type: type === 'order' ? 'earned' : type === 'refund' ? 'refund' : 'bonus',
      points: pointsToAdd,
      description: transactionDescription,
      orderId: orderId || undefined,
      expiresAt,
      createdAt: new Date(),
    });

    // Update totals
    loyaltyAccount.totalPoints += pointsToAdd;
    loyaltyAccount.availablePoints += pointsToAdd;

    if (type !== 'refund') {
      loyaltyAccount.lifetimePoints += pointsToAdd;

      // Update tier
      const { tiers } = LOYALTY_RULES;
      if (loyaltyAccount.lifetimePoints >= tiers.platinum.minPoints) {
        loyaltyAccount.tier = 'platinum';
      } else if (loyaltyAccount.lifetimePoints >= tiers.gold.minPoints) {
        loyaltyAccount.tier = 'gold';
      } else if (loyaltyAccount.lifetimePoints >= tiers.silver.minPoints) {
        loyaltyAccount.tier = 'silver';
      }
    }

    await loyaltyAccount.save();

    return NextResponse.json({
      success: true,
      data: {
        pointsEarned: pointsToAdd,
        totalPoints: loyaltyAccount.availablePoints,
        tier: loyaltyAccount.tier,
      },
    });
  } catch (error) {
    console.error('Points earning error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add points' },
      { status: 500 }
    );
  }
}

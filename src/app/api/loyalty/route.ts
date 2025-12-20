import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LoyaltyPoints, { LOYALTY_RULES } from '@/models/LoyaltyPoints';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get user's loyalty points and tier
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    let loyaltyAccount = await LoyaltyPoints.findOne({ user: session.user.id });

    // Create account if doesn't exist
    if (!loyaltyAccount) {
      loyaltyAccount = await LoyaltyPoints.create({
        user: session.user.id,
        totalPoints: LOYALTY_RULES.bonuses.signup,
        availablePoints: LOYALTY_RULES.bonuses.signup,
        lifetimePoints: LOYALTY_RULES.bonuses.signup,
        tier: 'bronze',
        transactions: [
          {
            type: 'bonus',
            points: LOYALTY_RULES.bonuses.signup,
            description: 'Welcome bonus for joining ShopHub!',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + LOYALTY_RULES.expirationDays * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    // Get tier info
    const tierInfo = LOYALTY_RULES.tiers[loyaltyAccount.tier as keyof typeof LOYALTY_RULES.tiers];
    const nextTier = getNextTier(loyaltyAccount.tier);
    const nextTierInfo = nextTier ? LOYALTY_RULES.tiers[nextTier as keyof typeof LOYALTY_RULES.tiers] : null;
    const pointsToNextTier = nextTierInfo
      ? nextTierInfo.minPoints - loyaltyAccount.lifetimePoints
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        availablePoints: loyaltyAccount.availablePoints,
        lifetimePoints: loyaltyAccount.lifetimePoints,
        tier: loyaltyAccount.tier,
        tierInfo: {
          name: loyaltyAccount.tier.charAt(0).toUpperCase() + loyaltyAccount.tier.slice(1),
          benefits: tierInfo.benefits,
          multiplier: tierInfo.multiplier,
        },
        nextTier: nextTier
          ? {
              name: nextTier.charAt(0).toUpperCase() + nextTier.slice(1),
              pointsNeeded: pointsToNextTier,
              progress: Math.round(
                ((loyaltyAccount.lifetimePoints - tierInfo.minPoints) /
                  (nextTierInfo!.minPoints - tierInfo.minPoints)) *
                  100
              ),
            }
          : null,
        recentTransactions: loyaltyAccount.transactions
          .slice(-10)
          .reverse()
          .map((t) => ({
            type: t.type,
            points: t.points,
            description: t.description,
            date: t.createdAt,
          })),
        redemptionValue: loyaltyAccount.availablePoints / LOYALTY_RULES.pointsPerDollarRedemption,
        minRedemption: LOYALTY_RULES.minRedemption,
        pointsPerDollar: Math.floor(LOYALTY_RULES.pointsPerDollar * tierInfo.multiplier),
      },
    });
  } catch (error) {
    console.error('Loyalty points fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty points' },
      { status: 500 }
    );
  }
}

function getNextTier(currentTier: string): string | null {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Gift,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Crown,
  Sparkles,
  Check,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
};

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
};

async function fetchLoyaltyData() {
  const res = await fetch('/api/loyalty');
  if (!res.ok) throw new Error('Failed to fetch loyalty data');
  const data = await res.json();
  return data.data;
}

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redeemAmount, setRedeemAmount] = useState(500);

  const { data: loyalty, isLoading, refetch } = useQuery({
    queryKey: ['loyalty'],
    queryFn: fetchLoyaltyData,
    enabled: status === 'authenticated',
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/profile/loyalty');
    return null;
  }

  const handleRedeem = async () => {
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: redeemAmount }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Mbruk! Rbe7ti $${data.data.dollarValue.toFixed(2)} discount!`);
        refetch();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Chi mochkil wq3, 3awd jarreb');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ShopHub Rewards
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Jma3 points w rba7 discounts!
          </p>
        </div>

        {loyalty && (
          <>
            {/* Tier Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br ${tierColors[loyalty.tier as keyof typeof tierColors]} p-6 text-white shadow-xl`}
            >
              <div className="absolute right-0 top-0 opacity-10">
                <Crown className="h-48 w-48" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{tierIcons[loyalty.tier as keyof typeof tierIcons]}</span>
                  <div>
                    <p className="text-sm opacity-80">Current Tier</p>
                    <h2 className="text-2xl font-bold">{loyalty.tierInfo.name} Member</h2>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-80">Available Points</p>
                    <p className="text-3xl font-bold">{loyalty.availablePoints.toLocaleString()}</p>
                    <p className="text-sm opacity-80">= ${loyalty.redemptionValue.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
                    <p className="text-sm opacity-80">Lifetime Points</p>
                    <p className="text-3xl font-bold">{loyalty.lifetimePoints.toLocaleString()}</p>
                  </div>
                </div>

                {loyalty.nextTier && (
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Progress to {loyalty.nextTier.name}</span>
                      <span>{loyalty.nextTier.pointsNeeded.toLocaleString()} points left</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${loyalty.nextTier.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                {loyalty.tierInfo.name} Benefits
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {loyalty.tierInfo.benefits.map((benefit: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Kat rbe7 <strong>{loyalty.pointsPerDollar} points</strong> 3la kol $1 lli katshri!
              </p>
            </motion.div>

            {/* Redeem Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Gift className="h-5 w-5 text-purple-500" />
                7wel Points l Discount
              </h3>

              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  Chhal bghiti t7wel? (Minimum: {loyalty.minRedemption} points)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 2500, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRedeemAmount(amount)}
                      disabled={amount > loyalty.availablePoints}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        redeemAmount === amount
                          ? 'bg-blue-600 text-white'
                          : amount > loyalty.availablePoints
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {amount.toLocaleString()} pts = ${(amount / 100).toFixed(0)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRedeem}
                disabled={redeemAmount > loyalty.availablePoints || redeemAmount < loyalty.minRedemption}
                className="w-full sm:w-auto"
              >
                7wel {redeemAmount.toLocaleString()} Points → ${(redeemAmount / 100).toFixed(2)} OFF
              </Button>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900"
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Activity
              </h3>

              {loyalty.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {loyalty.recentTransactions.map((transaction: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.points > 0
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {transaction.points > 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <Gift className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.points > 0 ? '+' : ''}
                        {transaction.points.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Mazal ma 3ndek transactions. Bda t'shri bach trbe7 points!
                </p>
              )}
            </motion.div>

            {/* How to Earn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white"
            >
              <h3 className="mb-4 text-xl font-bold">Kifash Trba7 Points?</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    🛍️
                  </div>
                  <div>
                    <p className="font-medium">T'shri</p>
                    <p className="text-sm opacity-80">{loyalty.pointsPerDollar} pts / $1</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    ⭐
                  </div>
                  <div>
                    <p className="font-medium">Kteb Review</p>
                    <p className="text-sm opacity-80">50 pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    👥
                  </div>
                  <div>
                    <p className="font-medium">Jib Sa7bek</p>
                    <p className="text-sm opacity-80">1,000 pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    🎂
                  </div>
                  <div>
                    <p className="font-medium">Birthday Bonus</p>
                    <p className="text-sm opacity-80">500 pts</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

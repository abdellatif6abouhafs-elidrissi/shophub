'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Loader2, CheckCircle, Percent, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

export default function CouponInput() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { coupon, applyCoupon, removeCoupon, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply coupon');
      }

      applyCoupon(data.data);
      setCode('');
      setIsExpanded(false);
      toast.success(`Coupon applied! You saved ${formatPrice(data.data.discount)}`);
    } catch (error: any) {
      toast.error(error.message || 'Invalid coupon code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  // If coupon is already applied, show the applied coupon
  if (coupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-800 dark:text-green-300">
                  {coupon.code}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                  {coupon.discountType === 'percentage' ? (
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {coupon.discountValue}% OFF
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {coupon.discountValue} OFF
                    </span>
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                {coupon.description}
              </p>
              <p className="mt-1 text-sm font-semibold text-green-800 dark:text-green-300">
                You save: {formatPrice(coupon.discount)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="rounded-full p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            <Tag className="h-4 w-4" />
            Have a coupon code?
          </motion.button>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleApplyCoupon}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="pl-10 uppercase"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading || !code.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsExpanded(false);
                  setCode('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

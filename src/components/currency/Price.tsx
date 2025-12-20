'use client';

import { useCurrencyStore } from '@/store/currencyStore';

interface PriceProps {
  amount: number;
  showCode?: boolean;
  className?: string;
  originalPrice?: number; // For showing discounts
}

export default function Price({
  amount,
  showCode = false,
  className = '',
  originalPrice,
}: PriceProps) {
  const { formatPrice, _hasHydrated } = useCurrencyStore();

  // Show USD by default before hydration
  if (!_hasHydrated) {
    const fallbackFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return (
      <span className={className}>
        {originalPrice && (
          <span className="mr-2 text-gray-400 line-through">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(originalPrice)}
          </span>
        )}
        {fallbackFormat}
      </span>
    );
  }

  return (
    <span className={className}>
      {originalPrice && (
        <span className="mr-2 text-gray-400 line-through">
          {formatPrice(originalPrice, showCode)}
        </span>
      )}
      {formatPrice(amount, showCode)}
    </span>
  );
}

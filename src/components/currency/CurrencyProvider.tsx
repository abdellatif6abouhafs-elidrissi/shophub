'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';

export default function CurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setExchangeRates, setLoading, setError } = useCurrencyStore();

  useEffect(() => {
    async function fetchRates() {
      setLoading(true);
      try {
        const response = await fetch('/api/exchange-rates');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        setExchangeRates({
          base: data.base,
          rates: data.rates,
          lastUpdated: data.lastUpdated,
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setError('Failed to load exchange rates');
      } finally {
        setLoading(false);
      }
    }

    fetchRates();

    // Refresh rates every hour
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setExchangeRates, setLoading, setError]);

  return <>{children}</>;
}

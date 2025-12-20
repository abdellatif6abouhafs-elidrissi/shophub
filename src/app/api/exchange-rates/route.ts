import { NextResponse } from 'next/server';
import { currencyList } from '@/lib/currencies';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

// In-memory cache for exchange rates
let ratesCache: {
  rates: Record<string, number>;
  timestamp: number;
} | null = null;

// Fallback rates (approximate, updated periodically)
const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  MAD: 10.05,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AED: 3.67,
};

export async function GET() {
  try {
    const now = Date.now();

    // Check if cached rates are still valid
    if (ratesCache && now - ratesCache.timestamp < CACHE_DURATION * 1000) {
      return NextResponse.json({
        base: 'USD',
        rates: ratesCache.rates,
        lastUpdated: new Date(ratesCache.timestamp).toISOString(),
        cached: true,
      });
    }

    // Fetch fresh rates from API
    const supportedCodes = currencyList.map(c => c.code).join(',');

    // Try primary API (exchangerate-api.com free tier)
    let rates: Record<string, number> | null = null;

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`,
        { next: { revalidate: CACHE_DURATION } }
      );

      if (response.ok) {
        const data = await response.json();
        rates = {};

        // Filter to only our supported currencies
        for (const currency of currencyList) {
          if (data.rates[currency.code]) {
            rates[currency.code] = data.rates[currency.code];
          }
        }
      }
    } catch (apiError) {
      console.error('Primary exchange rate API failed:', apiError);
    }

    // If primary API fails, try backup API
    if (!rates) {
      try {
        const backupResponse = await fetch(
          `https://open.er-api.com/v6/latest/USD`,
          { next: { revalidate: CACHE_DURATION } }
        );

        if (backupResponse.ok) {
          const data = await backupResponse.json();
          rates = {};

          for (const currency of currencyList) {
            if (data.rates[currency.code]) {
              rates[currency.code] = data.rates[currency.code];
            }
          }
        }
      } catch (backupError) {
        console.error('Backup exchange rate API failed:', backupError);
      }
    }

    // If both APIs fail, use fallback rates
    if (!rates) {
      console.warn('Using fallback exchange rates');
      rates = { ...fallbackRates };
    }

    // Update cache
    ratesCache = {
      rates,
      timestamp: now,
    };

    return NextResponse.json({
      base: 'USD',
      rates,
      lastUpdated: new Date(now).toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    // Return fallback rates on error
    return NextResponse.json({
      base: 'USD',
      rates: fallbackRates,
      lastUpdated: new Date().toISOString(),
      fallback: true,
    });
  }
}

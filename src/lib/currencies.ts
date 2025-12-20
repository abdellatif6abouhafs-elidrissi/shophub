/**
 * Currency configuration and utilities
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

// Supported currencies
export const currencies: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
  },
  MAD: {
    code: 'MAD',
    symbol: 'DH',
    name: 'Moroccan Dirham',
    locale: 'ar-MA',
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    decimals: 2,
  },
};

// Default currency
export const defaultCurrency = currencies.USD;

// Get currency list for dropdown
export const currencyList = Object.values(currencies);

// Format price with currency
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  showCode: boolean = false
): string {
  const currency = currencies[currencyCode] || defaultCurrency;

  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);

    return showCode ? `${formatted} ${currency.code}` : formatted;
  } catch {
    // Fallback for unsupported currencies
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`;
  }
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  // Convert to USD first (base currency), then to target
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

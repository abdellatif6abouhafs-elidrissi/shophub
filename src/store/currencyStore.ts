import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Currency, currencies, defaultCurrency } from '@/lib/currencies';

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

interface CurrencyState {
  currency: Currency;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setCurrency: (currencyCode: string) => void;
  setExchangeRates: (rates: ExchangeRates) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number, showCode?: boolean) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: defaultCurrency,
      exchangeRates: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setCurrency: (currencyCode) => {
        const currency = currencies[currencyCode];
        if (currency) {
          set({ currency });
        }
      },

      setExchangeRates: (rates) => {
        set({ exchangeRates: rates, error: null });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      convertPrice: (priceUSD) => {
        const { currency, exchangeRates } = get();

        // If USD or no rates, return original price
        if (currency.code === 'USD' || !exchangeRates) {
          return priceUSD;
        }

        const rate = exchangeRates.rates[currency.code];
        if (!rate) {
          return priceUSD;
        }

        return priceUSD * rate;
      },

      formatPrice: (priceUSD, showCode = false) => {
        const { currency, convertPrice } = get();
        const convertedPrice = convertPrice(priceUSD);

        try {
          const formatted = new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: currency.decimals,
            maximumFractionDigits: currency.decimals,
          }).format(convertedPrice);

          return showCode ? `${formatted} ${currency.code}` : formatted;
        } catch {
          return `${currency.symbol}${convertedPrice.toFixed(currency.decimals)}`;
        }
      },
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ currency: state.currency }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

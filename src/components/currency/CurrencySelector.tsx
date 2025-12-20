'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrencyStore } from '@/store/currencyStore';
import { currencyList } from '@/lib/currencies';

interface CurrencySelectorProps {
  variant?: 'header' | 'footer' | 'minimal';
}

export default function CurrencySelector({ variant = 'header' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency, _hasHydrated } = useCurrencyStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setCurrency(code);
    setIsOpen(false);
  };

  // Don't render until hydrated to prevent mismatch
  if (!_hasHydrated) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Globe className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">USD</span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <span>{currency.code}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full z-50 mt-2 max-h-64 w-48 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {currencyList.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr.code)}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currency.code === curr.code
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="w-8 font-medium">{curr.symbol}</span>
                  <span>{curr.code}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          variant === 'header'
            ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">{currency.symbol}</span>
        <span>{currency.code}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-50 mt-2 max-h-80 w-56 overflow-auto rounded-lg border py-2 shadow-xl ${
              variant === 'header'
                ? 'right-0 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                : 'bottom-full left-0 mb-2 border-gray-700 bg-gray-800'
            }`}
          >
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Select Currency
            </div>
            {currencyList.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleSelect(curr.code)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  currency.code === curr.code
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : variant === 'header'
                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="w-8 text-lg">{curr.symbol}</span>
                <div>
                  <p className="font-medium">{curr.code}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{curr.name}</p>
                </div>
                {currency.code === curr.code && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

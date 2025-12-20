'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import SessionProvider from './SessionProvider';
import ThemeProvider from './ThemeProvider';
import { QuickViewProvider } from '@/context/QuickViewContext';
import { CompareProvider } from '@/context/CompareContext';
import CurrencyProvider from '@/components/currency/CurrencyProvider';

interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <QuickViewProvider>
            <CompareProvider>
              <CurrencyProvider>
                {children}
              </CurrencyProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-text)',
                  },
                }}
              />
            </CompareProvider>
          </QuickViewProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

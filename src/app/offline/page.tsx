'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <WifiOff className="h-12 w-12 text-gray-400" />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          You're Offline
        </h1>

        <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            While you're offline, you can:
          </h2>
          <ul className="space-y-2 text-left text-sm text-blue-800 dark:text-blue-200">
            <li>• View previously loaded pages</li>
            <li>• Browse your saved cart items</li>
            <li>• Check your wishlist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

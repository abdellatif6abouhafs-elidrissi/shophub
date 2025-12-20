'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 *
 * Protects routes that require authentication.
 * Works in conjunction with middleware for double protection.
 *
 * Features:
 * - Shows loading state while checking session
 * - Redirects non-authenticated users to login with callback URL
 * - Provides smooth transition experience
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    setIsChecking(false);
  }, [status, router, pathname]);

  // Loading state
  if (status === 'loading' || isChecking) {
    return (
      fallback || (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!session) {
    return null; // Will redirect
  }

  // Authenticated
  return <>{children}</>;
}

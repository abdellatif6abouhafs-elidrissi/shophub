'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminGuard Component
 *
 * Protects admin routes on the client side.
 * Works in conjunction with middleware for double protection.
 *
 * Features:
 * - Shows loading state while checking session
 * - Redirects non-authenticated users to login
 * - Shows access denied for non-admin users
 * - Provides smooth transition experience
 */
export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.replace('/login?error=Please login to access admin area');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.replace('/?error=unauthorized');
      return;
    }

    setIsChecking(false);
  }, [status, session, router]);

  // Loading state
  if (status === 'loading' || isChecking) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verifying Access
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we verify your admin credentials...
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

  // Not admin
  if (session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don&apos;t have permission to access this area.
            This section is restricted to administrators only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Authorized admin
  return <>{children}</>;
}

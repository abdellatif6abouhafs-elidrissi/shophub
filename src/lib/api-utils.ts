import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type UserRole = 'user' | 'admin';

export interface AuthResult {
  authenticated: boolean;
  session: Awaited<ReturnType<typeof getServerSession>> | null;
  isAdmin: boolean;
  userId: string | null;
  error?: NextResponse;
}

/**
 * Check if the current request is from an authenticated user
 * Returns session info or an error response
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authenticated: false,
      session: null,
      isAdmin: false,
      userId: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    session,
    isAdmin: session.user.role === 'admin',
    userId: session.user.id,
  };
}

/**
 * Check if the current request is from an admin user
 * Returns session info or an error response
 */
export async function requireAdmin(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authenticated: false,
      session: null,
      isAdmin: false,
      userId: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== 'admin') {
    return {
      authenticated: true,
      session,
      isAdmin: false,
      userId: session.user.id,
      error: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    session,
    isAdmin: true,
    userId: session.user.id,
  };
}

/**
 * Check if user owns a resource or is admin
 */
export async function requireOwnerOrAdmin(resourceOwnerId: string): Promise<AuthResult> {
  const auth = await requireAuth();

  if (auth.error) {
    return auth;
  }

  const isOwner = auth.userId === resourceOwnerId;
  const isAdmin = auth.isAdmin;

  if (!isOwner && !isAdmin) {
    return {
      ...auth,
      error: NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Standard API error response
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Paginated API success response
 */
export function apiPaginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  extras?: Record<string, unknown>
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
    ...extras,
  });
}

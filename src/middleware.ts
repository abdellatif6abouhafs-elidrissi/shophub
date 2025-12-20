import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = ['/profile', '/checkout', '/wishlist'];

// Routes that require admin role
const adminRoutes = ['/admin'];

// Routes that should redirect authenticated users (like login page)
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token (session)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAdmin = token?.role === 'admin';

  // Check if current path matches any protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path is an auth route (login, register)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle admin routes - require admin role
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'Please login to access admin area');
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // User is authenticated but not admin - redirect to home with error
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }

    // Admin user accessing admin route - allow
    return NextResponse.next();
  }

  // Handle protected routes - require authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute && isAuthenticated) {
    // Redirect admin to admin dashboard, users to home
    const redirectUrl = new URL(isAdmin ? '/admin' : '/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Add user info to headers for server components
  const response = NextResponse.next();

  if (isAuthenticated) {
    response.headers.set('x-user-id', token.id as string);
    response.headers.set('x-user-role', token.role as string);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};

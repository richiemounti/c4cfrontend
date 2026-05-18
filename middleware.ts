// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/organizations',
  '/projects',
  '/stakeholders',
  '/admin'
];

// Define public routes that are accessible without authentication
const publicRoutes = [
  '/',
  '/account/login',
  '/account/signup',
  '/account/forgot-password',
  '/account/reset-password',
  '/api/auth/callback',
  '/support',
  '/news',
  '/purchase',
  '/survey',
];

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Allow public files (CSS, images, etc.)
  if (
    path.includes('.') || // Has file extension
    path.startsWith('/_next') ||
    path.startsWith('/api/') ||
    path.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check for the token in cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // If it's a protected route and the user is not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    // Create the URL to redirect to
    const redirectUrl = new URL('/account/login', request.url);
    redirectUrl.searchParams.set('from', path);
    
    // Redirect to login
    return NextResponse.redirect(redirectUrl);
  }

  // If it's a login/signup page and the user is authenticated, redirect to ?from= or dashboard
  if ((path === '/account/login' || path === '/account/signup') && isAuthenticated) {
    const from = request.nextUrl.searchParams.get('from');
    const destination = from && from.startsWith('/') ? from : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // For all other cases, continue
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
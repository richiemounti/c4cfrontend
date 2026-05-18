// app/api/auth/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  // If there's a code, this is a callback from the OAuth provider
  if (code) {
    const error = searchParams.get('error');

    if (error) {
      // Redirect to login with error message
      const redirectUrl = new URL('/account/login', request.url);
      redirectUrl.searchParams.set('error', error);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Call your backend API to exchange the code for a token
      const response = await fetch(`${API_URL}/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${request.nextUrl.origin}/api/auth/callback?provider=${provider}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Set token in cookies and redirect to dashboard
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
      redirectResponse.cookies.set({
        name: 'token',
        value: data.data.token,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      // Also set user data in a non-httpOnly cookie for client-side access
      redirectResponse.cookies.set({
        name: 'user',
        value: JSON.stringify(data.data.user),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return redirectResponse;
    } catch (error) {
      console.error('OAuth callback error:', error);
      // Redirect to login with error message
      const redirectUrl = new URL('/account/login', request.url);
      redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication failed');
      return NextResponse.redirect(redirectUrl);
    }
  } 
  // If there's no code, redirect to provider-specific route
  else {
    const redirectUri = searchParams.get('redirect_uri') || `${request.nextUrl.origin}/api/auth/callback?provider=${provider}`;
    
    return NextResponse.redirect(new URL(`/api/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`, request.url));
  }
}
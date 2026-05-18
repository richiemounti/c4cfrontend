// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri') || `${request.nextUrl.origin}/api/auth/callback?provider=google`;
  
  // Redirect to backend OAuth endpoint
  const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  return NextResponse.redirect(authUrl);
}
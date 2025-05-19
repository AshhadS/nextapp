import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    // Protect chat routes
    if (req.nextUrl.pathname.startsWith('/chat') && !session) {
      const redirectUrl = new URL('/auth/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to chat if already logged in
    if (
      (req.nextUrl.pathname.startsWith('/auth/login') ||
        req.nextUrl.pathname.startsWith('/auth/register')) &&
      session
    ) {
      const redirectUrl = new URL('/chat', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/chat/:path*', '/auth/:path*'],
};

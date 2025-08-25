import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, searchParams } = req.nextUrl;

  // Public, never redirect these
  const PUBLIC_PATHS = new Set([
    '/',                 // landing
    '/therapist/login',  // therapist login
    '/patient/login',    // patient login
    '/logout',           // client logout page if you have one
  ]);

  // Skip Next internals and API
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api')
  ) {
    return res;
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return res;
  }

  // Everything under /therapist or /patient requires auth
  if (pathname.startsWith('/therapist') || pathname.startsWith('/patient')) {
    if (!session) {
      const nextUrl = req.nextUrl.clone();
      nextUrl.pathname = pathname.startsWith('/therapist')
        ? '/therapist/login'
        : '/patient/login';
      // Preserve intended destination
      nextUrl.searchParams.set('next', pathname + (searchParams.size ? `?${searchParams.toString()}` : ''));
      return NextResponse.redirect(nextUrl);
    }
  }

  return res;
}

// Apply to all non-static paths
export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};


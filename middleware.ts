import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const url = new URL(req.url);
  const p = url.pathname;

  const needsAuth =
    p.startsWith('/therapist') ||
    (p.startsWith('/patient') && p !== '/patient/chat');

  if (needsAuth && !session) {
    const login = p.startsWith('/therapist') ? '/therapist/login' : '/patient/login';
    const redirectUrl = new URL(login, req.url);
    redirectUrl.searchParams.set('next', p + url.search);
    return NextResponse.redirect(redirectUrl);
  }

  // If user visits a login page but already signed in, bounce to the dashboard
  if (session && (p === '/therapist/login' || p === '/patient/login')) {
    const dest = p.startsWith('/therapist') ? '/therapist' : '/patient';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

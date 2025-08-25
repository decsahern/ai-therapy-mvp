import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    has_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_SUPABASE_ANON: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}


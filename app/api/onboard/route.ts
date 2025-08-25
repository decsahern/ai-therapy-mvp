// app/api/onboard/route.ts
import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

/**
 * POST /api/onboard
 * Body: { role: 'patient' | 'therapist' }
 * Ensures a row exists in your role table for the signed-in user.
 */
export async function POST(req: Request) {
  const supabase = await supabaseServer(); // <-- IMPORTANT: await

  // Confirm auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Read requested role
  const { role } = (await req.json().catch(() => ({}))) as {
    role?: 'patient' | 'therapist';
  };

  if (role !== 'patient' && role !== 'therapist') {
    return NextResponse.json({ error: 'role must be patient or therapist' }, { status: 400 });
  }

  // Upsert into the right table by user_id
  if (role === 'therapist') {
    const { error } = await supabase
      .from('therapists')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('patients')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

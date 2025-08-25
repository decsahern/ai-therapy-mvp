import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // who is logged in?
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // find therapist row for this user
  const { data: therapist, error: tErr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
  if (!therapist) return NextResponse.json({ error: 'Therapist not found for user' }, { status: 404 });

  // fetch therapist-level prompt
  const { data: row, error: pErr } = await supabase
    .from('therapist_prompts')
    .select('prompt, updated_at')
    .eq('therapist_id', therapist.id)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({
    prompt: row?.prompt ?? '',
    updated_at: row?.updated_at ?? null
  });
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // find therapist row for this user
  const { data: therapist, error: tErr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
  if (!therapist) return NextResponse.json({ error: 'Therapist not found for user' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const prompt = (body as { prompt?: string })?.prompt ?? '';

  // upsert therapist-level prompt
  const { error: upErr } = await supabase
    .from('therapist_prompts')
    .upsert({ therapist_id: therapist.id, prompt })
    .eq('therapist_id', therapist.id);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

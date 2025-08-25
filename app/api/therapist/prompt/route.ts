import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supaAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: authData } = await supaAuth.auth.getSession();
    const userId = authData?.session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: therapist, error: tErr } = await db
      .from('therapists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    if (!therapist?.id) return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });

    const { data: row, error } = await db
      .from('therapist_prompts')
      .select('prompt, updated_at')
      .eq('therapist_id', therapist.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ prompt: row?.prompt ?? '', updated_at: row?.updated_at ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === 'string' ? body.prompt : '';

    const cookieStore = cookies();
    const supaAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: authData } = await supaAuth.auth.getSession();
    const userId = authData?.session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: therapist, error: tErr } = await db
      .from('therapists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    if (!therapist?.id) return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });

    const { error } = await db
      .from('therapist_prompts')
      .upsert({ therapist_id: therapist.id, prompt }, { onConflict: 'therapist_id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

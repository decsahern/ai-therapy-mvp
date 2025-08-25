import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const supabase = await supabaseServer();

  const url = new URL(req.url);
  const patientId = url.searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tRow } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!tRow) return NextResponse.json({ prompt: '', updated_at: null });

  const { data } = await supabase
    .from('patient_prompts')
    .select('prompt, updated_at')
    .eq('patient_id', patientId)
    .maybeSingle();

  return NextResponse.json({
    prompt: data?.prompt ?? '',
    updated_at: data?.updated_at ?? null,
  });
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();

  const body = await req.json().catch(() => ({}));
  const { patientId, prompt } = body as { patientId?: string; prompt?: string };

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { error } = await supabase
    .from('patient_prompts')
    .upsert({ patient_id: patientId, prompt: prompt ?? '' }, { onConflict: 'patient_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}


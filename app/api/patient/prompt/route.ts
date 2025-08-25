// app/api/patient/prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

/**
 * GET /api/patient/prompt?patientId=...
 * - Returns the L3 prompt for a patient.
 * - If patientId is not provided, defaults to the signed-in user's id.
 */
export async function GET(req: NextRequest) {
  const supabase = await supabaseServer(); // IMPORTANT: await

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') ?? user.id;

  // Adjust table/columns if yours are named differently
  const { data, error } = await supabase
    .from('patient_prompts')
    .select('prompt')
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prompt: data?.prompt ?? '' });
}

/**
 * PUT /api/patient/prompt
 * Body: { patientId?: string, prompt: string }
 * - Upserts the L3 prompt for a patient.
 * - If patientId is omitted, uses the signed-in user's id.
 */
export async function PUT(req: NextRequest) {
  const supabase = await supabaseServer(); // IMPORTANT: await

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    patientId?: string;
    prompt?: string;
  };

  const patientId = body.patientId ?? user.id;
  const prompt = body.prompt ?? '';

  const { error } = await supabase
    .from('patient_prompts')
    .upsert({ patient_id: patientId, prompt }, { onConflict: 'patient_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

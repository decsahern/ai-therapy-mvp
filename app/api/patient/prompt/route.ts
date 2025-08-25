export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerWithAuth } from '@/lib/supabaseServer';

/**
 * GET /api/patient/prompt?patientId=UUID
 * Returns the current patient-specific (Level 3) prompt.
 * RLS ensures only the therapist linked to this patient (via conversations) can read it.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseServerWithAuth();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('patient_prompts')
      .select('prompt, updated_at')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If there is no row (or RLS hides it), return an empty prompt gracefully
    return NextResponse.json({
      prompt: data?.prompt ?? '',
      updated_at: data?.updated_at ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/patient/prompt
 * Body: { patientId: UUID, prompt: string }
 * Upserts the patient-specific prompt.
 * RLS ensures only the therapist linked to this patient (via conversations) can write it.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServerWithAuth();
    const body = await req.json().catch(() => ({}));
    const patientId = body?.patientId as string | undefined;
    const prompt = body?.prompt as string | undefined;

    if (!patientId || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid body. Expect { patientId: UUID, prompt: string }' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_prompts')
      .upsert({ patient_id: patientId, prompt });

    if (error) {
      // If RLS blocks, this will contain a helpful message like "permission denied for table ..."
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

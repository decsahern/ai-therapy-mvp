export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only, bypasses RLS
);

// GET /api/therapist/prompt?therapistId=UUID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');
    if (!therapistId) {
      return NextResponse.json({ error: 'Missing therapistId' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('therapist_prompts')
      .select('prompt, updated_at')
      .eq('therapist_id', therapistId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      prompt: data?.prompt ?? '',
      updated_at: data?.updated_at ?? null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

// POST /api/therapist/prompt  body: { therapistId, prompt }
export async function POST(req: NextRequest) {
  try {
    const { therapistId, prompt } = await req.json();
    if (!therapistId || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing therapistId or prompt' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('therapist_prompts')
      .upsert({ therapist_id: therapistId, prompt });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

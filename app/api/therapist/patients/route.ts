import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET() {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: therapistRow, error: tErr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (tErr || !therapistRow) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('patient_id')
    .eq('therapist_id', therapistRow.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const seen = new Set<string>();
  const items =
    (data ?? [])
      .map((row: { patient_id?: string | null }) => row?.patient_id ?? undefined)
      .filter((id): id is string => !!id && !seen.has(id) && (seen.add(id), true))
      .map((id) => ({ id }));

  return NextResponse.json({ items });
}


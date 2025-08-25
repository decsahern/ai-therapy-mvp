import { NextResponse } from 'next/server';
import { supabaseServerWithAuth } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = supabaseServerWithAuth();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 });
  if (!user) return NextResponse.json({ items: [] });

  const { data: therapist, error: terr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (terr) return NextResponse.json({ error: terr.message }, { status: 500 });
  if (!therapist?.id) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from('conversations')
    .select('patient_id')
    .eq('therapist_id', therapist.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Safe, TS-friendly dedupe
  const seen = new Set<string>();
  const items: { id: string }[] = [];
  for (const row of (data ?? [])) {
    const id = row?.patient_id as string | undefined;
    if (id && !seen.has(id)) {
      seen.add(id);
      items.push({ id });
    }
  }

  return NextResponse.json({ items });
}
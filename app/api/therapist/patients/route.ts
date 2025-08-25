import { NextResponse } from 'next/server';
import { supabaseServerWithAuth } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = supabaseServerWithAuth();

  // Who am I?
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) return NextResponse.json({ error: uerr.message }, { status: 500 });
  if (!user) return NextResponse.json({ items: [] });

  // Find therapist row for this user
  const { data: therapist, error: terr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (terr) return NextResponse.json({ error: terr.message }, { status: 500 });
  if (!therapist?.id) return NextResponse.json({ items: [] });

  // Read conversations for this therapist (RLS must allow select)
  const { data, error } = await supabase
    .from('conversations')
    .select('patient_id')
    .eq('therapist_id', therapist.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Unique patient IDs
  const seen = new Set<string>();
  const items = (data ?? [])
    .map(row => row?.patient_id as string | undefined)
    .filter((id): id is string => !!id && !seen.has(id) && seen.add(id))
    .map(id => ({ id }));

  return NextResponse.json({ items });
}

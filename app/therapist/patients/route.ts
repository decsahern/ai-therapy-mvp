import { NextResponse } from 'next/server';
import { supabaseServerWithAuth } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = supabaseServerWithAuth();

  // Find the therapist row for the signed-in user
  const { data: t, error: terr } = await supabase
    .from('therapists')
    .select('id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .maybeSingle();

  if (terr) return NextResponse.json({ error: terr.message }, { status: 500 });
  if (!t?.id) return NextResponse.json({ items: [] });

  // Patients linked by conversations with this therapist
  const { data, error } = await supabase
    .from('conversations')
    .select('patient_id, patients(name)')
    .eq('therapist_id', t.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Deduplicate by patient_id
  const seen = new Set<string>();
  const items = (data ?? []).reduce((acc: any[], row: any) => {
    if (row?.patient_id && !seen.has(row.patient_id)) {
      seen.add(row.patient_id);
      acc.push({ id: row.patient_id, name: row.patients?.name ?? '(Patient)' });
    }
    return acc;
  }, []);

  return NextResponse.json({ items });
}

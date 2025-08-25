import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

type ConversationRow = { patient_id?: string | null };

export async function GET(_req: NextRequest) {
  try {
    // 1) Auth session via cookie
    const cookieStore = cookies();
    const supaAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: authData } = await supaAuth.auth.getSession();
    const userId = authData?.session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    // 2) Server-side Supabase (service role)
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3) Find therapist id for this user
    const { data: therapist, error: tErr } = await db
      .from('therapists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (tErr) return NextResponse.json({ error: `DB error: ${tErr.message}` }, { status: 500 });
    if (!therapist?.id) return NextResponse.json({ error: 'Therapist not found for this user' }, { status: 404 });

    // 4) Fetch conversations → unique patient ids
    const { data, error } = await db
      .from('conversations')
      .select('patient_id')
      .eq('therapist_id', therapist.id);

    if (error) return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });

    const seen = new Set<string>();
    const items: { id: string }[] = [];
    (data ?? []).forEach((row: ConversationRow) => {
      const id = row?.patient_id ?? undefined;
      if (id && !seen.has(id)) {
        seen.add(id);
        items.push({ id });
      }
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

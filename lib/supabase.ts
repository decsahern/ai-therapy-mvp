import { createClient } from '@supabase/supabase-js';

export default function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.'
    );
  }

  // Stores session in localStorage; fine for client-side pages.
  return createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

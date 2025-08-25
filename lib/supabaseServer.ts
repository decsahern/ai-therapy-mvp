// lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Server-side Supabase client.
 * It's async because some setups expose cookies() as async in Next 15.
 */
export default async function supabaseServer() {
  const cookieStore: any = await (cookies() as any);

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  return client;
}

// Optional named export if you ever want it:
export { supabaseServer as createSupabaseServer };

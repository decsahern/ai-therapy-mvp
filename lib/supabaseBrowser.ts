// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';

// Default export for easy importing: `import supabaseBrowser from '@/lib/supabaseBrowser'`
export default function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

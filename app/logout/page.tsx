'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser'; // <-- curly braces, named import

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const supabase = supabaseBrowser(); // <-- CALL it to get a Supabase client
        await supabase.auth.signOut();
      } finally {
        router.replace('/login');
      }
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Signing you out…</p>;
}

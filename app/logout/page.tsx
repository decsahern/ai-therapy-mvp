'use client';

import { useEffect } from 'react';
import supabaseBrowser from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      router.replace('/');
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Signing you out…</p>
    </main>
  );
}


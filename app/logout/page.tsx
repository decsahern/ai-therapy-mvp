'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowser from '@/lib/supabaseBrowser';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      router.replace('/');
    })();
  }, [router]);

  return <div className="p-6">Signing you out…</div>;
}


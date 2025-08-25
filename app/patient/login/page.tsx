'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseBrowser from '@/lib/supabaseBrowser';

export default function PatientLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/patient';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleLogin() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }
      if (!data.session) {
        setMsg('No session returned. Check Supabase Auth settings.');
        return;
      }

      // Hard redirect to avoid any stale state
      router.replace(next);
    } catch (e: any) {
      setMsg(e?.message || 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Patient Login</h1>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          disabled={busy}
          onClick={handleLogin}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {msg && <div className="text-red-600 text-sm">{msg}</div>}
      </div>
    </main>
  );
}

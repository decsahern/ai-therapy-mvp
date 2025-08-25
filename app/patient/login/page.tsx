'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowser from '@/lib/supabaseBrowser';

export default function PatientLoginPage() {
  const router = useRouter();

  // default target dashboard; we'll read ?next= from URL in useEffect
  const [nextPath, setNextPath] = useState('/patient');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Read query param without useSearchParams (avoids build errors)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const n = url.searchParams.get('next');
      if (n) setNextPath(n);
    } catch {}
  }, []);

  async function handleLogin() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMsg(error.message);
      if (!data.session) return setMsg('No session returned. Check email verification settings.');
      router.replace(nextPath);
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
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          type="button"
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          onClick={handleLogin}
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <a
          href="/patient/register?next=/patient"
          className="text-sm text-blue-600 underline mt-2"
        >
          Need an account? Register
        </a>

        {msg && <div className="text-red-600 text-sm">{msg}</div>}
      </div>
    </main>
  );
}

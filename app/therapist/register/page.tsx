'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseBrowser from '@/lib/supabaseBrowser';

export default function TherapistRegisterPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/therapist');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const n = url.searchParams.get('next');
      if (n) setNextPath(n);
    } catch {}
  }, []);

  async function handleRegister() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'therapist' } },
      });
      if (error) return setMsg(error.message);

      if (!data.session) {
        setMsg('Check your email to verify your account, then sign in.');
        return;
      }

      router.replace(nextPath);
    } catch (e: any) {
      setMsg(e?.message || 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Therapist Registration</h1>

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
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          onClick={handleRegister}
          disabled={busy}
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <a
          href="/therapist/login?next=/therapist"
          className="text-sm text-blue-600 underline mt-2"
        >
          Already have an account? Sign in
        </a>

        {msg && <div className="text-red-600 text-sm">{msg}</div>}
      </div>
    </main>
  );
}

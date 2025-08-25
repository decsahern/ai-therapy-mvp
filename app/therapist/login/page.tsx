'use client';

import { useState } from 'react';
import supabaseBrowser from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

export default function TherapistLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn() {
    setBusy(true); setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push('/therapist'); // dashboard
  }

  async function signUp() {
    setBusy(true); setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setBusy(false); setErr(error.message); return; }

    // Ensure role rows exist
    const res = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'therapist' }),
    });
    setBusy(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error || 'Onboarding failed');
      return;
    }
    router.push('/therapist');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Therapist — Sign in / Register</h1>

        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            onClick={signIn}
            disabled={busy}
          >
            {busy ? 'Working…' : 'Sign in'}
          </button>
          <button
            className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded disabled:opacity-60"
            onClick={signUp}
            disabled={busy}
          >
            {busy ? 'Working…' : 'Register'}
          </button>
        </div>

        {err && <div className="text-red-600 text-sm text-center">{err}</div>}
      </div>
    </main>
  );
}




'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabaseBrowser from '@/lib/supabaseBrowser';

function PatientLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/patient';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin() {
    setBusy(true); setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push(next); // redirect ONLY after successful login
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
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          onClick={handleLogin}
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {err && <div className="text-red-600 text-sm">{err}</div>}
      </div>
    </main>
  );
}

export default function PatientLoginPage() {
  // Suspense fixes: “useSearchParams should be wrapped in a suspense boundary”
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <PatientLoginInner />
    </Suspense>
  );
}


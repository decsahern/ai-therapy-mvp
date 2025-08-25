'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password: pwd });
        if (error) throw error;
        setMsg('Account created. Now sign in.');
        setMode('signin');
        return;
      }

      // SIGN IN (this will sync session to auth cookies used by middleware/server)
      const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) throw error;

      // Optional: verify we really have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session after sign-in');

      router.push('/therapist/prompts');
    } catch (e: any) {
      setMsg(e?.message || 'Auth error');
      console.error('LOGIN ERROR:', e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 16 }}>
      <h1>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>
      <input
        style={{ width: '100%', padding: 10, marginTop: 12 }}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={{ width: '100%', padding: 10, marginTop: 8 }}
        placeholder="Password"
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />
      <button disabled={busy} onClick={submit} style={{ marginTop: 12, padding: '10px 16px' }}>
        {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
      </button>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
      {msg && <p style={{ marginTop: 10, color: '#a00' }}>{msg}</p>}
    </div>
  );
}



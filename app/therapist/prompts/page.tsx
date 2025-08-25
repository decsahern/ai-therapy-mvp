'use client';
import { useEffect, useState } from 'react';

export default function TherapistPromptsPage() {
  // 👉 put your real therapist UUID here (from Supabase Table Editor)
  const therapistId = 'e9a5ee60-47fd-4995-820f-f653e5f358b2';

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setStatus('Loading…');
        const r = await fetch(`/api/therapist/prompt?therapistId=${therapistId}`);
        const data = await r.json();
        setPrompt(data?.prompt ?? '');
        setStatus(null);
      } catch (e: any) {
        setStatus('Failed to load current prompt.');
      } finally {
        setLoading(false);
      }
    })();
  }, [therapistId]);

  async function save() {
    try {
      setStatus('Saving…');
      const r = await fetch('/api/therapist/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, prompt })
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setStatus(`Save failed: ${err?.error ?? r.statusText}`);
        return;
      }
      setStatus('Saved ✔');
      setTimeout(() => setStatus(null), 1500);
    } catch (e: any) {
      setStatus('Network error.');
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h1>Therapist Prompt (Level-2)</h1>
      <p style={{ color: '#555' }}>
        This prompt shapes the assistant’s tone and methods for your patients. It is combined with the platform’s safety prompt.
      </p>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={12}
        style={{ width: '100%', padding: 12, border: '1px solid #ccc', borderRadius: 8 }}
        placeholder="e.g., You are a CBT-oriented therapist. Use Socratic questioning..."
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={save} disabled={loading} style={{ padding: '10px 16px', borderRadius: 8 }}>
          Save
        </button>
        {status && <span>{status}</span>}
      </div>
    </div>
  );
}

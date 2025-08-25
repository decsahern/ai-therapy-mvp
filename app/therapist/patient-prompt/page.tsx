'use client';
import { useEffect, useState } from 'react';

type PatientItem = { id: string; name?: string };

export default function PatientPromptEditor() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  // Load my patients (based on auth + RLS)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/therapist/patients');
        const j = await r.json();
        if (r.ok) setPatients(j.items ?? []);
      } catch {}
    })();
  }, []);

  async function load() {
    if (!patientId) return;
    setStatus('Loading…');
    try {
      const r = await fetch(`/api/patient/prompt?patientId=${patientId}`);
      let j: any = {};
      let txt = '';
      try { j = await r.json(); } catch { txt = await r.text().catch(()=> ''); }
      if (!r.ok) {
        setStatus(`Load failed: ${j?.error ?? txt || r.statusText}`);
      } else {
        setPrompt(j?.prompt ?? '');
        setStatus(null);
      }
    } catch (e: any) {
      setStatus('Network error loading prompt.');
    }
  }

  async function save() {
    if (!patientId) { setStatus('Pick a patient first.'); return; }
    setStatus('Saving…');
    try {
      const r = await fetch('/api/patient/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, prompt }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setStatus(`Save failed: ${j?.error ?? r.statusText}`);
      } else {
        setStatus('Saved ✔');
        setTimeout(() => setStatus(null), 1500);
      }
    } catch (e: any) {
      setStatus('Network error saving prompt.');
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h1>Patient-Specific Prompt (Level-3)</h1>
      <p style={{ color: '#555' }}>
        Pick one of your patients, or paste a patient UUID. You can only edit prompts for your own patients.
      </p>

      <div style={{ display:'grid', gap:8, marginBottom:12 }}>
        <label>Choose from your patients</label>
        <select
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          style={{ padding:10, border:'1px solid #ccc', borderRadius:8 }}
        >
          <option value="">— Select —</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.name || '(Patient)'} — {p.id.slice(0,8)}…
            </option>
          ))}
        </select>

        <label>…or paste Patient ID (UUID)</label>
        <input
          style={{ padding:10, border:'1px solid #ccc', borderRadius:8 }}
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          placeholder="e.g. 7f68b435-...."
        />

        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} style={{ padding:'10px 16px', borderRadius:8 }}>Load</button>
          <button onClick={save} style={{ padding:'10px 16px', borderRadius:8 }}>Save</button>
          {status && <span>{status}</span>}
        </div>
      </div>

      <label>Patient Prompt</label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={12}
        style={{ width:'100%', padding:12, border:'1px solid #ccc', borderRadius:8 }}
        placeholder="e.g., Focus on exposure tasks; avoid reassurance; end with 2 action items."
      />
    </div>
  );
}


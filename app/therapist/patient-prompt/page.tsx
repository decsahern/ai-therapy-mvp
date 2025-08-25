'use client';

import { useEffect, useState } from 'react';

type PatientItem = { id: string };

export default function PatientPromptPage() {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);

  const [patientId, setPatientId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  const [loadingPrompt, setLoadingPrompt] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Load patient list for the dropdown
  useEffect(() => {
    (async () => {
      setLoadingPatients(true);
      setStatus(null);
      try {
        const r = await fetch('/api/therapist/patients');
        if (!r.ok) {
          const txt = await r.text().catch(() => '');
          const errMsg = (txt || r.statusText || 'Failed to load patients');
          setStatus(`Patients load failed: ${errMsg}`);
          setPatients([]);
        } else {
          const j = (await r.json()) as { items?: PatientItem[] };
          setPatients(Array.isArray(j?.items) ? j.items : []);
          if (!patientId && Array.isArray(j?.items) && j.items.length > 0) {
            setPatientId(j.items[0].id);
          }
        }
      } catch (e: any) {
        setStatus(`Patients load error: ${e?.message ?? 'Network error'}`);
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPrompt() {
    if (!patientId) {
      setStatus('Choose a patient first.');
      return;
    }
    setLoadingPrompt(true);
    setStatus(null);
    try {
      const r = await fetch(`/api/patient/prompt?patientId=${encodeURIComponent(patientId)}`);
      let body: any = null;
      let txt = '';
      try { body = await r.json(); } catch { txt = await r.text().catch(() => ''); }

      if (!r.ok) {
        const errMsg = (body?.error ?? txt ?? r.statusText ?? 'Load failed');
        setStatus(`Load failed: ${String(errMsg)}`);
        return;
      }
      setPrompt(typeof body?.prompt === 'string' ? body.prompt : '');
      setStatus(null);
    } catch (e: any) {
      setStatus(`Load error: ${e?.message ?? 'Network error'}`);
    } finally {
      setLoadingPrompt(false);
    }
  }

  async function savePrompt() {
    if (!patientId) {
      setStatus('Choose a patient first.');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const r = await fetch('/api/patient/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, prompt }),
      });
      let body: any = null;
      let txt = '';
      try { body = await r.json(); } catch { txt = await r.text().catch(() => ''); }

      if (!r.ok || body?.ok !== true) {
        const errMsg = (body?.error ?? txt ?? r.statusText ?? 'Save failed');
        setStatus(`Save failed: ${String(errMsg)}`);
        return;
      }
      setStatus('Saved ✔');
    } catch (e: any) {
      setStatus(`Save error: ${e?.message ?? 'Network error'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h1>Patient-Specific Prompt (L3)</h1>

      <div style={{ display: 'grid', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <div>
          <label htmlFor="patient">Patient</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <select
              id="patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={loadingPatients}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 8 }}
            >
              {loadingPatients ? (
                <option value="">Loading…</option>
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id}
                  </option>
                ))
              ) : (
                <option value="">No patients found</option>
              )}
            </select>

            <button
              onClick={loadPrompt}
              disabled={loadingPrompt || !patientId}
              style={{ padding: '8px 12px', borderRadius: 8 }}
            >
              {loadingPrompt ? 'Loading…' : 'Load'}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Use a calm, validating tone. Keep replies under 5 sentences. End with 2 actionable steps."
            style={{
              width: '100%',
              height: 160,
              padding: 12,
              border: '1px solid #ccc',
              borderRadius: 8,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={savePrompt}
            disabled={saving || !patientId}
            style={{ padding: '10px 16px', borderRadius: 10 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {status && <span style={{ color: /failed|error/i.test(status) ? 'crimson' : 'green' }}>{status}</span>}
        </div>
      </div>
    </div>
  );
}

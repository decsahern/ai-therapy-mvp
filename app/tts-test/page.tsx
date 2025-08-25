'use client';
import { useRef, useState } from 'react';

export default function TTSTest() {
  const [msg, setMsg] = useState('This is a short test.');
  const [voiceId, setVoiceId] = useState('AWdsNuF696ObSghiFHAv'); // ← put your ElevenLabs Voice ID
  const [status, setStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function runTest() {
    try {
      setStatus('Requesting audio…');
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg, voiceId }),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setStatus(`TTS error: ${err?.error ?? r.statusText}`);
        return;
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setStatus('Playing…');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
        await audioRef.current.play().catch(() => {
          setStatus('Click Play to hear it.');
        });
      }
    } catch (e: any) {
      setStatus(`Network error: ${e?.message ?? ''}`);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h1>TTS Tester</h1>
      <label>Text</label>
      <input
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
        value={msg}
        onChange={e => setMsg(e.target.value)}
      />
      <label>ElevenLabs Voice ID</label>
      <input
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
        value={voiceId}
        onChange={e => setVoiceId(e.target.value)}
      />
      <button onClick={runTest} style={{ padding: '10px 16px' }}>Generate & Play</button>

      <div style={{ marginTop: 12 }}>
        <audio ref={audioRef} controls />
      </div>

      {status && <p style={{ marginTop: 8 }}><b>Status:</b> {status}</p>}
    </div>
  );
}

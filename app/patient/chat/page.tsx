'use client';
import { useEffect, useRef, useState } from 'react';

type ChatMsg = { from: 'you' | 'ai'; text: string };

export default function PatientChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔊 audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ Fill these with your real values
  const conversationId = '2f0aab1e-ebb5-48b1-83d4-148dbec66d20';
  const voiceId = 'AWdsNuF696ObSghiFHAv';

  // (Optional) Load history
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/chat/history?conversationId=${conversationId}`);
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data?.items)) {
          setMessages(
            data.items.map((m: any) => ({
              from: m.role === 'patient' ? 'you' : 'ai',
              text: m.text || ''
            }))
          );
        }
      } catch {
        // history load failure is non-fatal; ignore for MVP
      }
    })();
  }, [conversationId]);

  async function send() {
    if (!input.trim()) return;
    const yourText = input.trim();
    setMessages(m => [...m, { from: 'you', text: yourText }]);
    setInput('');
    setLoading(true);

    try {
      // 1) Save patient message, get assistant reply + the assistant message id
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: yourText, conversationId })
      });

      const data = await r.json();
      if (!r.ok) {
        setMessages(m => [...m, { from: 'ai', text: `Server error: ${data?.error ?? 'Unknown'}` }]);
        return;
      }

      const replyText = (data?.reply ?? '') as string;
      const assistantMessageId = data?.assistantMessageId as string | undefined;

      setMessages(m => [...m, { from: 'ai', text: replyText }]);

      // 2) Generate + store TTS, expect { url } (signed URL)
      const tts = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, voiceId, messageId: assistantMessageId })
      });

      if (tts.ok) {
        // Parse JSON (do NOT use blob here; backend returns { url })
        let url = '';
        try {
          const d = await tts.json();
          url = d?.url || '';
        } catch {
          // If route didn't return JSON, show raw body below
        }

        if (url) {
          console.log('TTS signed URL:', url);
          setAudioUrl(url);
          // Try autoplay (some browsers block first play; user can press Play)
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = url;
              audioRef.current.load();
              audioRef.current.play().catch(() => {});
            }
          }, 0);
        } else {
          const raw = await tts.text().catch(() => '(no body)');
          setMessages(m => [
            ...m,
            { from: 'ai', text: `TTS error: no URL returned. Raw: ${raw.slice(0, 200)}` }
          ]);
        }
      } else {
        let errText = 'TTS error.';
        try {
          const err = await tts.json();
          errText = `TTS error: ${err?.error ?? 'unknown'}`;
        } catch {
          const raw = await tts.text().catch(() => '(no body)');
          errText = `TTS error: ${raw.slice(0, 200)}`;
        }
        setMessages(m => [...m, { from: 'ai', text: errText }]);
      }
    } catch (e: any) {
      setMessages(m => [...m, { from: 'ai', text: `Network error: ${e?.message ?? ''}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: 16 }}>
      <h1>Patient Chat</h1>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') send();
          }}
          placeholder="Type how you're feeling..."
        />
        <button onClick={send} disabled={loading} style={{ padding: '12px 16px', borderRadius: 8 }}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{ background: m.from === 'you' ? '#eef' : '#efe', padding: 12, borderRadius: 8 }}
          >
            <b>{m.from === 'you' ? 'You' : 'Assistant'}</b>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{m.text}</div>
          </div>
        ))}
      </div>

      {/* Audio player (enabled when we have a signed URL) */}
      {audioUrl && (
        <div style={{ marginTop: 16 }}>
          <audio
            ref={audioRef}
            controls
            autoPlay
            src={audioUrl}
            onError={() => console.log('audio load error for', audioUrl)}
          />
          <div style={{ marginTop: 6 }}>
            <a href={audioUrl} target="_blank" rel="noreferrer">
              Open audio in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

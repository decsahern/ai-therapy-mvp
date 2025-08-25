// ✅ Force Node runtime
export const runtime = 'nodejs';

// ✅ Imports must be at the top
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Server-side Supabase client (service role) for Storage + DB writes
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 👉 If your bucket name is `assistant-tts` (underscore) in Supabase UI,
// change this to 'assistant_tts'.
const BUCKET = 'assistant-tts';

export async function GET() {
  // Handy probe for your browser
  return NextResponse.json({ ok: true, hint: 'POST { text, voiceId, messageId? }' });
}

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, messageId } = await req.json();
    if (!text || !voiceId) {
      return NextResponse.json({ error: 'Missing text or voiceId' }, { status: 400 });
    }

    // 1) Call ElevenLabs → get MP3 bytes
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY as string,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
      }),
    });

    if (!r.ok) {
      const msg = await r.text();
      return NextResponse.json({ error: `ElevenLabs error: ${msg}` }, { status: 500 });
    }

    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);
    const mime = 'audio/mpeg';

    // 2) Choose a filename (use messageId if provided so we can link later)
    const fileName = `${messageId ?? crypto.randomUUID()}.mp3`;

    // 3) Upload to your private bucket
    const up = await supabaseServer.storage.from(BUCKET).upload(fileName, buf, {
      contentType: mime,
      upsert: true,
    });
    if (up.error) {
      return NextResponse.json({ error: `Upload failed: ${up.error.message}` }, { status: 500 });
    }

    // 4) If we know the message row, save path + mime back to messages
    if (messageId) {
      await supabaseServer
        .from('messages')
        .update({ audio_path: fileName, audio_mime: mime })
        .eq('id', messageId);
    }

    // 5) Return a short-lived signed URL for playback
    const signed = await supabaseServer.storage.from(BUCKET).createSignedUrl(fileName, 60 * 60); // 1 hour
    if (signed.error || !signed.data?.signedUrl) {
      return NextResponse.json({ error: 'Could not sign URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signed.data.signedUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

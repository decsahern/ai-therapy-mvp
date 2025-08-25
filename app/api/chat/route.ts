// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optional GET so visiting /api/chat in a browser doesn't error
export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST { message, conversationId } to this endpoint.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = await req.json();
    if (!message || !conversationId) {
      return NextResponse.json(
        { error: 'Missing input: message and conversationId are required' },
        { status: 400 }
      );
    }

    // 🔐 Your existing therapist UUID (Level-2)
    const therapistId = 'e9a5ee60-47fd-4995-820f-f653e5f358b2';

    // A) Save patient's message first
    const ins1 = await supabaseServer
      .from('messages')
      .insert([{ conversation_id: conversationId, role: 'patient', text: message }]);
    if (ins1.error) {
      return NextResponse.json(
        { error: `Supabase insert (patient) failed: ${ins1.error.message}` },
        { status: 500 }
      );
    }

    // B) Fetch patient_id from the conversation (to get Level-3)
    const conv = await supabaseServer
      .from('conversations')
      .select('patient_id, therapist_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (conv.error || !conv.data?.patient_id) {
      return NextResponse.json(
        { error: `Conversation lookup failed or patient missing: ${conv.error?.message ?? 'no data'}` },
        { status: 500 }
      );
    }

    const patientId: string = conv.data.patient_id;

    // C) Build system prompt: Level-1 + Level-2 + Level-3
    const level1 =
      process.env.PLATFORM_SYSTEM_PROMPT ||
      'You are a safe, supportive therapy assistant. Keep answers concise and evidence-based.';

    // Level-2 (therapist)
    const tp = await supabaseServer
      .from('therapist_prompts')
      .select('prompt')
      .eq('therapist_id', therapistId)
      .maybeSingle();
    if (tp.error) {
      return NextResponse.json(
        { error: `Failed to fetch therapist prompt: ${tp.error.message}` },
        { status: 500 }
      );
    }
    const level2 = tp.data?.prompt ?? '';

    // Level-3 (patient)
    const pp = await supabaseServer
      .from('patient_prompts')
      .select('prompt')
      .eq('patient_id', patientId)
      .maybeSingle();
    if (pp.error) {
      return NextResponse.json(
        { error: `Failed to fetch patient prompt: ${pp.error.message}` },
        { status: 500 }
      );
    }
    const level3 = pp.data?.prompt ?? '';

    const systemMessage = [level1, level2, level3].filter(Boolean).join('\n\n');

    // D) Ask OpenAI with combined prompts
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 500 });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    if (!reply) {
      return NextResponse.json({ error: 'OpenAI returned no reply' }, { status: 500 });
    }

    // E) Save assistant reply and return its id for TTS
    const ins2 = await supabaseServer
      .from('messages')
      .insert([{ conversation_id: conversationId, role: 'assistant', text: reply }])
      .select('id')
      .single();

    if (ins2.error) {
      return NextResponse.json(
        { error: `Supabase insert (assistant) failed: ${ins2.error.message}` },
        { status: 500 }
      );
    }

    const assistantMessageId = ins2.data?.id;
    return NextResponse.json({ reply, assistantMessageId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

// app/api/chat/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
// Gemini 2.5 Flash — fastest and free-tier friendly
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are GlobalHub's friendly AI support assistant. Be helpful, warm and concise (2-3 sentences max).

Key facts:
- GlobalHub provides football signals and Aviator game signals worldwide
- Football: Normal $2.50, Big Game $4.30, Super $6.00 per signal
- Aviator: $3 single, $10 for 4, $18 for 8, $25 for 12 signals
- Payment via Paystack — cards, M-Pesa, mobile money, 100+ countries
- Signals valid 24hrs (Aviator: 2hrs after dispatch)
- 94% football accuracy rate
- No subscription — pay per signal
- Must be 18+ to use
- Support: support.globalhub.team@gmail.com
- Available in 100+ countries, 10 languages

Always encourage responsible gaming. If unsure, direct to support email.`;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('[chat] GEMINI_API_KEY not set');
      return Response.json({
        reply: "I'm having a setup issue. Please email support.globalhub.team@gmail.com for help!",
      });
    }

        const { messages, userId } = await req.json();

    // Fetch user context if logged in
    let userContext = '';
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const [walletRes, withdrawRes, txRes, profileRes] = await Promise.all([
          sb.from('wallets').select('available_balance, pending_balance, total_deposited, total_withdrawn').eq('user_id', userId).maybeSingle(),
          sb.from('withdrawal_requests').select('amount, status, created_at, expires_at, payout_method, reference').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
          sb.from('wallet_transactions').select('type, amount, status, created_at, reference, description').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
          sb.from('profiles').select('email, full_name').eq('id', userId).maybeSingle(),
        ]);

        const w = walletRes.data as { available_balance?: number; pending_balance?: number; total_deposited?: number; total_withdrawn?: number } | null;
        const p = profileRes.data as { email?: string; full_name?: string } | null;
        const withdrawals = (withdrawRes.data ?? []) as Array<{ amount: number; status: string; created_at: string; payout_method: string; reference: string; expires_at?: string }>;
        const txs = (txRes.data ?? []) as Array<{ type: string; amount: number; status: string; created_at: string; reference: string; description?: string }>;

        userContext = `

─── USER CONTEXT (Do NOT share raw IDs, only use to answer questions) ───
Name: ${p?.full_name || 'unknown'}
Email: ${p?.email || 'unknown'}
Available balance: $${(w?.available_balance ?? 0).toFixed(2)} USD
Pending balance: $${(w?.pending_balance ?? 0).toFixed(2)} USD
Total deposited: $${(w?.total_deposited ?? 0).toFixed(2)} USD
Total withdrawn: $${(w?.total_withdrawn ?? 0).toFixed(2)} USD

Recent withdrawals:
${withdrawals.length === 0 ? '  (none)' : withdrawals.map(x => `  - $${x.amount} via ${x.payout_method} · ${x.status} · ${new Date(x.created_at).toLocaleDateString()}`).join('\n')}

Recent transactions:
${txs.length === 0 ? '  (none)' : txs.map(x => `  - ${x.type} $${x.amount} · ${x.status} · ${new Date(x.created_at).toLocaleDateString()}`).join('\n')}

When the user asks about their account, use this data. Be warm and clear. If they ask something not covered, tell them to email support.globalhub.team@gmail.com.`;
      } catch (e) {
        console.error('[chat] context fetch failed:', e);
      }
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ reply: 'No message provided.' }, { status: 400 });
    }

    // Take last 6 messages for context
    const recent = messages.slice(-6);

    // Build Gemini-format contents (role: 'user' | 'model')
    const contents = recent.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
            systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT + userContext }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        topP: 0.9,
      },
    };

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[chat] Gemini error:', res.status, errText);
      return Response.json({
        reply: "I'm having trouble right now. Email support.globalhub.team@gmail.com!",
      });
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm having trouble right now. Email support.globalhub.team@gmail.com!";

    return Response.json({ reply: reply.trim() });
  } catch (error) {
    console.error('[chat] fatal:', error);
    return Response.json({
      reply: 'Sorry, I\'m having a technical issue. Please email support.globalhub.team@gmail.com for help!',
    });
  }
}
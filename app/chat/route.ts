import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return Response.json({
        reply: "I'm having a setup issue. Please email support.globalhub.team@gmail.com for help!"
      });
    }

    const res = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 300,
          system: `You are GlobalHub's friendly AI support assistant. Be helpful, warm and concise (2-3 sentences max).

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

Always encourage responsible gaming. If unsure, direct to support email.`,
          messages: messages.slice(-6).map((m: {
            role: string; content: string
          }) => ({
            role: m.role,
            content: m.content
          }))
        })
      }
    );

    const data = await res.json();
    const reply = data.content?.[0]?.text ||
      "I'm having trouble right now. Email support.globalhub.team@gmail.com!";

    return Response.json({ reply });

  } catch (error) {
    console.error('Chat error:', error);
    return Response.json({
      reply: "Sorry, I'm having a technical issue. Please email support.globalhub.team@gmail.com for help!"
    });
  }
}
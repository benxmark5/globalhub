import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, amount, currency, method } = await req.json();
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    if (!secret || !appUrl) {
      return Response.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const reference = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const amountKES = Math.ceil(amount * 129.5);

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKES * 100,
        currency: 'KES',
        reference,
        callback_url: `${appUrl}/wallet/deposit/verify?reference=${reference}`,
        metadata: {
          type: 'wallet_deposit',
          userId,
          amountUSD: amount,
          currency: currency || 'USD',
        },
      }),
    });

    const data = await res.json();
    if (!data.status) {
      return Response.json({ error: data.message || 'Deposit initialization failed' }, { status: 400 });
    }

    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount,
      currency: currency || 'USD',
      status: 'pending',
      reference,
      description: `wallet deposit via ${method || 'card'}`,
      metadata: { amountKES, method },
    });

    return Response.json({
      success: true,
      authorizationUrl: data.data?.authorization_url,
      reference,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Deposit failed' }, { status: 500 });
  }
}
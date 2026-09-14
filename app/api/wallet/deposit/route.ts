// app/api/wallet/deposit/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase-server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !APP_URL) {
      console.error('[wallet/deposit] missing env');
      return Response.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    // ── AUTH ──
    const auth = await getAuthUser();
    if (!auth.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.id;
    const userEmail = auth.user.email;
    if (!userEmail) {
      return Response.json({ error: 'Missing email on account' }, { status: 400 });
    }

    const body = await req.json();
    const { amount, currency, method } = body;

    if (!amount) {
      return Response.json({ error: 'amount required' }, { status: 400 });
    }

    const amountUSD = Number(amount);
    if (!Number.isFinite(amountUSD) || amountUSD < 1) {
      return Response.json({ error: 'Minimum deposit is $1' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const minDeposit = await getMinDeposit(supabase);
    if (amountUSD < minDeposit) {
      return Response.json({ error: `Minimum deposit is $${minDeposit}` }, { status: 400 });
    }

    const fxRate = await getKesRate(supabase);
    const amountKES = Math.ceil(amountUSD * fxRate);
    const paystackAmount = amountKES * 100;

    const reference = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const callbackUrl = `${APP_URL}/wallet/deposit/verify?reference=${reference}`;

    const payload = {
      email: userEmail,
      amount: paystackAmount,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: {
        purpose: 'wallet_deposit',
        userId,
        amountUSD,
        currency: currency || 'USD',
        method: method || 'card',
      },
    };

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.status) {
      console.error('[wallet/deposit] paystack error:', data);
      return Response.json(
        { error: data.message || 'Deposit initialization failed' },
        { status: 400 }
      );
    }

    // Pre-record as pending
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      type: 'deposit',
      amount: amountUSD,
      currency: currency || 'USD',
      status: 'pending',
      reference,
      description: `Wallet deposit via ${method || 'card'}`,
      metadata: { amountKES, fxRate, method },
    });

    return Response.json({
      success: true,
      authorizationUrl: data.data?.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('[wallet/deposit] fatal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Deposit failed' },
      { status: 500 }
    );
  }
}

async function getKesRate(supabase: ReturnType<typeof createClient>): Promise<number> {
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'usd_to_kes_rate')
      .single();
    const rate = (data?.value as { rate?: number } | null)?.rate;
    if (rate && rate > 0) return rate;
  } catch { /* fall through */ }
  return 129.5;
}

async function getMinDeposit(supabase: ReturnType<typeof createClient>): Promise<number> {
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'minimums')
      .single();
    const min = (data?.value as { deposit_usd?: number } | null)?.deposit_usd;
    if (min && min > 0) return min;
  } catch { /* fall through */ }
  return 1;
}
// app/api/paystack/initialize/route.ts
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !APP_URL) {
      console.error('[initialize] missing env');
      return Response.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const body = await req.json();
    const {
      email, amount,
      currency,              // visitor's display currency (e.g. 'KES', 'USD')
      userId, planType,      // 'football' | 'aviator' | 'signal_purchase'
      signalsCount, bonusSignals, planLabel,
      visitorCountry, visitorCurrency,
      purpose,               // NEW — 'signal_purchase' (default) or 'wallet_deposit'
    } = body;

    if (!email || !amount || !userId) {
      return Response.json({ error: 'email, amount, userId required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // FX rate from platform_settings (single source of truth)
    const fxRate = await getKesRate(supabase);

    // Amount arriving is in USD (base price). Convert USD → KES for settlement.
    const basePriceUSD = Number(amount);
    const amountKES = Math.ceil(basePriceUSD * fxRate);
    const paystackAmount = amountKES * 100; // KES kobo

    const reference = `gh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const callbackUrl = `${APP_URL}/payment/verify?reference=${reference}`;

    // The final purpose — default to signal_purchase if not specified
    const finalPurpose = purpose === 'wallet_deposit' ? 'wallet_deposit' : 'signal_purchase';

    const payload = {
      email,
      amount: paystackAmount,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: {
        // ⚠️ This is what the webhook reads
        purpose: finalPurpose,
        userId,
        amountUSD: basePriceUSD,
        // Signal-specific extras (only meaningful when purpose === 'signal_purchase')
        planType,
        signalsCount,
        bonusSignals,
        planLabel,
        signalType: planType,
        plan: planLabel,
        customerCountry: visitorCountry || 'Unknown',
        customerCurrency: visitorCurrency || currency || 'USD',
        displayPrice: amount,
        displayCurrency: currency || 'USD',
        settlementCurrency: 'KES',
        settlementAmount: amountKES,
        exchangeRate: fxRate,
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
      console.error('[initialize] paystack error:', data);
      return Response.json({ error: data.message || 'Payment init failed' }, { status: 400 });
    }

    // Record in purchases — always, so admin can see all payment intents
    await supabase.from('purchases').insert({
      user_id: userId,
      email,
      reference,
      amount: amountKES,
      currency: 'KES',
      display_amount: amount,
      display_currency: currency || 'USD',
      base_price_usd: basePriceUSD,
      exchange_rate: fxRate,
      plan: planLabel || (finalPurpose === 'wallet_deposit' ? 'Wallet Top-up' : 'Signal Package'),
      signal_type: planType || finalPurpose,
      signals_count: signalsCount || 1,
      bonus_signals: bonusSignals || 0,
      status: 'pending',
      visitor_country: visitorCountry || 'Unknown',
      visitor_currency: visitorCurrency || 'USD',
      payment_started_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('[initialize] fatal:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

// ------------------------------------------------------------
// Read KES rate from platform_settings (single source)
// ------------------------------------------------------------
async function getKesRate(supabase: ReturnType<typeof createClient>): Promise<number> {
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'usd_to_kes_rate')
      .single();

    const rate = (data?.value as { rate?: number } | null)?.rate;
    if (rate && rate > 0) return rate;
  } catch {
    // fall through to default
  }
  // Fallback only if the row is missing — never hardcode elsewhere
  return 129.5;
}
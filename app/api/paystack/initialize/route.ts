import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Always settle in KES — Paystack Kenya processes it
const USD_TO_KES = 129.50;

export async function POST(req: NextRequest) {
  try {
    const {
      email, amount, currency,
      userId, planType, signalsCount,
      bonusSignals, planLabel,
      visitorCountry, visitorCurrency
    } = await req.json();

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return Response.json({ error: 'Paystack not configured' }, { status: 500 });
    }

    // ── CORE FIX ──────────────────────────────
    // `amount` arriving is already in local currency units (e.g. CHF 2.45)
    // We need to convert it to KES for Paystack
    //
    // Strategy:
    // 1. Treat incoming amount as USD base price
    //    (frontend sends usdPrice * localRate already handled in UI)
    //    So we just need: usdPrice → KES → kobo/smallest unit
    //
    // Frontend now sends basePriceUSD separately:
    const basePriceUSD = req.headers.get('x-base-usd')
      ? parseFloat(req.headers.get('x-base-usd')!)
      : amount; // fallback if header not set

    // Convert USD → KES (settlement currency)
    const amountKES = Math.ceil(basePriceUSD * USD_TO_KES);

    // Paystack expects smallest currency unit (kobo/cents)
    // For KES: 1 KES = 100 kobo
    const paystackAmount = amountKES * 100;

    const reference = `gh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?reference=${reference}`;

    // Paystack payload — always KES settlement
    const payload = {
      email,
      amount: paystackAmount,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: {
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan', value: planLabel },
          { display_name: 'Signal Type', variable_name: 'signal_type', value: planType },
          { display_name: 'Country', variable_name: 'country', value: visitorCountry || 'Unknown' },
        ],
        customerCountry: visitorCountry || 'Unknown',
        customerCurrency: visitorCurrency || 'USD',
        displayPrice: amount,
        basePriceUSD,
        settlementCurrency: 'KES',
        settlementAmount: amountKES,
        exchangeRate: USD_TO_KES,
        userId,
        planType,
        signalsCount,
        bonusSignals,
        planLabel,
      }
    };

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.status) {
      console.error('Paystack error:', data);
      return Response.json({ error: data.message || 'Payment init failed' }, { status: 400 });
    }

    // Save pending purchase to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    await supabase.from('purchases').insert({
      user_id: userId,
      email,
      reference,
      amount: amountKES,
      currency: 'KES',
      display_amount: amount,
      display_currency: visitorCurrency || 'USD',
      base_price_usd: basePriceUSD,
      exchange_rate: USD_TO_KES,
      plan: planLabel,
      signal_type: planType,
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
    console.error('Initialize error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
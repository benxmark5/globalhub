// app/api/wallet/withdraw/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

// Only these 4 methods are supported
const METHOD_RULES: Record<string, { fields: string[]; label: string }> = {
  mpesa:         { fields: ['payout_identifier', 'payout_name'],               label: 'M-Pesa' },
  airtel_money:  { fields: ['payout_identifier', 'payout_name'],               label: 'Airtel Money' },
  bank_transfer: { fields: ['payout_identifier', 'payout_name', 'payout_extra'], label: 'Bank Transfer' },
  paypal:        { fields: ['payout_identifier', 'payout_name'],               label: 'PayPal' },
};

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Config missing' }, { status: 500 });
    }

    const auth = await getAuthUser();
    if (!auth.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.id;

    const body = await req.json();
    const { amount, payoutMethod, payoutName, payoutIdentifier, payoutExtra } = body;

    if (!amount || !payoutMethod) {
      return Response.json({ error: 'Amount and payout method required' }, { status: 400 });
    }

    const amountUSD = Number(amount);
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const rule = METHOD_RULES[payoutMethod];
    if (!rule) {
      return Response.json(
        { error: `Unsupported payout method: ${payoutMethod}` },
        { status: 400 }
      );
    }

    const provided: Record<string, string> = {
      payout_name: (payoutName ?? '').toString().trim(),
      payout_identifier: (payoutIdentifier ?? '').toString().trim(),
      payout_extra: (payoutExtra ?? '').toString().trim(),
    };

    for (const field of rule.fields) {
      if (!provided[field]) {
        return Response.json(
          { error: `Missing required field: ${field.replace('payout_', '')}` },
          { status: 400 }
        );
      }
    }

    // Phone validation for mobile money
    if (payoutMethod === 'mpesa' || payoutMethod === 'airtel_money') {
      // Accepts international format: 1-15 digits
      if (!/^\d{10,15}$/.test(provided.payout_identifier)) {
        return Response.json(
          { error: 'Phone must be 10-15 digits including country code' },
          { status: 400 }
        );
      }
    }

    // Email validation for PayPal
    if (payoutMethod === 'paypal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(provided.payout_identifier)) {
        return Response.json({ error: 'Invalid PayPal email' }, { status: 400 });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: result, error: rpcError } = await supabase.rpc('create_withdrawal', {
      p_user_id: userId,
      p_amount_usd: amountUSD,
      p_payout_method: payoutMethod,
      p_payout_name: provided.payout_name,
      p_payout_identifier: provided.payout_identifier,
      p_payout_extra: provided.payout_extra || null,
    });

    if (rpcError) {
      console.error('[wallet/withdraw] rpc failed:', rpcError);
      return Response.json({ error: 'Withdrawal could not be created' }, { status: 500 });
    }

    const r = result as {
      ok: boolean;
      error?: string;
      reference?: string;
      expires_in_seconds?: number;
    } | null;

    if (!r?.ok) {
      return Response.json({ error: r?.error ?? 'Withdrawal rejected' }, { status: 400 });
    }

    await supabase.from('activity_feed').insert({
      type: 'withdrawal_request',
      title: 'New withdrawal request',
      description: `$${amountUSD.toFixed(2)} via ${rule.label} — Ref: ${r.reference}`,
      country: 'US',
      country_flag: '💸',
      metadata: { userId, amount: amountUSD, payoutMethod, reference: r.reference },
    });

    return Response.json({
      success: true,
      reference: r.reference,
      expiresInSeconds: r.expires_in_seconds ?? 1800,
    });
  } catch (error) {
    console.error('[wallet/withdraw] fatal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
// app/api/admin/pay-withdrawal/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_TO_PUBLIC_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_SECRET) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    // ── Auth: only allow calls from admin project ──
    const auth = req.headers.get('x-admin-secret');
    if (auth !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const withdrawalId = String(body?.withdrawal_id || '');
    if (!withdrawalId) {
      return NextResponse.json({ error: 'withdrawal_id required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Load withdrawal ──
    const { data: wr, error: wrErr } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .maybeSingle();

    if (wrErr || !wr) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    if (wr.status === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }
    if (wr.status !== 'approved') {
      return NextResponse.json(
        { error: `Withdrawal must be approved first (currently: ${wr.status})` },
        { status: 400 }
      );
    }
    if (wr.paystack_transfer_code) {
      return NextResponse.json(
        { error: 'Transfer already initiated', transfer_code: wr.paystack_transfer_code },
        { status: 400 }
      );
    }

    const amountUSD = Number(wr.amount);
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    // ── Get FX rate for USD → KES ──
    const { data: fxRow } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'usd_to_kes_rate')
      .maybeSingle();
    const fxRate = Number((fxRow?.value as { rate?: number } | null)?.rate) || 129.5;

    // ── Compute Paystack transfer currency + amount ──
    // For mobile_money / M-Pesa → KES. For USD bank transfers → USD.
    const method = String(wr.payout_method || '').toLowerCase();
    const isMobileMoney = method === 'mpesa' || method === 'airtel_money';
    const transferCurrency = isMobileMoney ? 'KES' : 'USD';
    const transferAmountMajor = isMobileMoney
      ? Math.round(amountUSD * fxRate)   // KES
      : amountUSD;
    const transferAmountMinor = Math.round(transferAmountMajor * 100);

    // ── Create or reuse Paystack recipient ──
    let recipientCode: string | null = null;

    const { data: cached } = await supabase
      .from('paystack_recipients')
      .select('recipient_code')
      .eq('user_id', wr.user_id)
      .eq('account_number', wr.payout_identifier)
      .eq('active', true)
      .maybeSingle();

    if (cached?.recipient_code) {
      recipientCode = cached.recipient_code;
    } else {
      // Create new recipient
      const recipientPayload = isMobileMoney
        ? {
            type: 'mobile_money',
            name: wr.payout_name,
            account_number: wr.payout_identifier,
            bank_code: 'MPESA', // adjust if you have a specific code; see Paystack /bank?currency=KES
            currency: 'KES',
          }
        : {
            type: 'nuban',
            name: wr.payout_name,
            account_number: wr.payout_identifier,
            bank_code: String(wr.payout_extra || ''),
            currency: 'NGN',
          };

      const rRes = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipientPayload),
      });
      const rData = await rRes.json();

      if (!rData.status || !rData.data?.recipient_code) {
        console.error('[pay-withdrawal] recipient create failed:', rData);
        return NextResponse.json(
          { error: rData.message || 'Could not create recipient' },
          { status: 400 }
        );
      }
      recipientCode = rData.data.recipient_code;

      await supabase.rpc('create_paystack_recipient_record', {
        p_user_id: wr.user_id,
        p_recipient_code: recipientCode,
        p_recipient_type: recipientPayload.type,
        p_name: recipientPayload.name,
        p_account_number: recipientPayload.account_number,
        p_bank_code: recipientPayload.bank_code,
        p_currency: recipientPayload.currency,
      });
    }

    // ── Create Paystack transfer ──
    const transferRef = `WD_${wr.id}_${Date.now()}`;
    const tRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: transferAmountMinor,
        currency: transferCurrency,
        recipient: recipientCode,
        reason: `Withdrawal payout — ${wr.reference}`,
        reference: transferRef,
      }),
    });
    const tData = await tRes.json();

    if (!tData.status || !tData.data?.transfer_code) {
      console.error('[pay-withdrawal] transfer create failed:', tData);
      return NextResponse.json(
        { error: tData.message || 'Paystack transfer failed' },
        { status: 400 }
      );
    }

    const transferCode = tData.data.transfer_code;

    // ── Save transfer code + status to withdrawal ──
    await supabase
      .from('withdrawal_requests')
      .update({
        paystack_recipient_code: recipientCode,
        paystack_transfer_code: transferCode,
        paystack_status: tData.data.status || 'pending',
        paystack_response: tData.data,
        transfer_currency: transferCurrency,
        transfer_amount_minor: transferAmountMinor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId);

    return NextResponse.json({
      ok: true,
      transfer_code: transferCode,
      recipient_code: recipientCode,
      status: tData.data.status,
      reference: transferRef,
    });
  } catch (err) {
    console.error('[pay-withdrawal] fatal:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
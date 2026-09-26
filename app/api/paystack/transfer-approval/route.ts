// app/api/payments/paystack/transfer-approval/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

// Paystack may sign the request. If they do, verify. Otherwise trust the payload.
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();

    // Optional signature verification
    const signature = req.headers.get('x-paystack-signature');
    if (signature && PAYSTACK_SECRET) {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET)
        .update(raw)
        .digest('hex');
      if (hash !== signature) {
        console.warn('[transfer-approval] invalid signature');
        return NextResponse.json({ approved: false, reason: 'invalid signature' }, { status: 400 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ approved: false, reason: 'invalid json' }, { status: 400 });
    }

    // Paystack sends: { event, data: { transfer_code, amount, currency, recipient, reference } }
    const data = payload?.data ?? payload;
    const transferCode = data?.transfer_code;
    const amountMinor = Number(data?.amount ?? 0);
    const currency = String(data?.currency || '').toUpperCase();

    if (!transferCode) {
      return NextResponse.json({ approved: false, reason: 'no transfer_code' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('[transfer-approval] Supabase config missing');
      return NextResponse.json({ approved: false, reason: 'config' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Look up the withdrawal
    const { data: wr } = await supabase
      .from('withdrawal_requests')
      .select('id, status, amount, transfer_currency, transfer_amount_minor, paystack_recipient_code')
      .eq('paystack_transfer_code', transferCode)
      .maybeSingle();

    if (!wr) {
      console.warn('[transfer-approval] no matching withdrawal for', transferCode);
      return NextResponse.json({ approved: false, reason: 'unknown transfer' }, { status: 400 });
    }

    if (wr.status === 'paid') {
      console.warn('[transfer-approval] withdrawal already paid', transferCode);
      return NextResponse.json({ approved: true, note: 'already paid' });
    }

    // Validate amount
    const expected = Number(wr.transfer_amount_minor || 0);
    if (expected > 0 && Math.abs(amountMinor - expected) > 1) {
      console.warn('[transfer-approval] amount mismatch', { expected, got: amountMinor, transferCode });
      return NextResponse.json({ approved: false, reason: 'amount mismatch' }, { status: 400 });
    }

    // Validate currency
    if (wr.transfer_currency && currency && wr.transfer_currency !== currency) {
      console.warn('[transfer-approval] currency mismatch', { expected: wr.transfer_currency, got: currency });
      return NextResponse.json({ approved: false, reason: 'currency mismatch' }, { status: 400 });
    }

    // All checks passed — approve
    console.log('[transfer-approval] approved', { transferCode, amountMinor, currency });
    return NextResponse.json({ approved: true });
  } catch (err) {
    console.error('[transfer-approval] fatal:', err);
    return NextResponse.json(
      { approved: false, reason: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}

// Some integrations use GET for the approval handshake
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'transfer-approval' });
}
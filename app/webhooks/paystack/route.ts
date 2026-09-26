// app/webhooks/paystack/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  try {
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[webhook] Missing env keys');
      return new NextResponse('Config error', { status: 500 });
    }

    // ── Verify signature ──
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.warn('[webhook] Invalid signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('[webhook] event:', event.event, event.data?.reference);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const reference: string = event.data?.reference ?? '';
    if (!reference) {
      return NextResponse.json({ ok: true, ignored: 'no reference' });
    }

    // ── Route FIRST (before dedupe) ──
    switch (event.event) {
      case 'charge.success': {
        const result = await handleChargeSuccess(supabase, event.data);
        if (!result.ok) {
          console.error('[webhook] charge.success handler failed, allowing retry:', result.error);
          return new NextResponse('Handler failed', { status: 500 });
        }
        break;
      }
      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        console.log('[webhook] transfer event received (handled later):', event.event);
        break;
      default:
        console.log('[webhook] unhandled event:', event.event);
    }

    // ── Record processed event ──
    const { error: dedupeError } = await supabase
      .from('payment_events')
      .insert({
        reference,
        event_type: event.event,
        payload: event,
      });

    if (dedupeError && (dedupeError as { code?: string }).code !== '23505') {
      console.error('[webhook] dedupe insert failed:', dedupeError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook] fatal:', err);
    return new NextResponse('Webhook error', { status: 500 });
  }
}

// ------------------------------------------------------------
// charge.success handler
// ------------------------------------------------------------
async function handleChargeSuccess(
  supabase: ReturnType<typeof createClient>,
  data: {
    reference: string;
    amount: number;
    currency: string;
    customer?: { email?: string };
    metadata?: Record<string, unknown>;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const reference = data.reference;
  const amountMinor = data.amount ?? 0;
  const currency = (data.currency || 'KES').toUpperCase();
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;

  const purpose = (metadata.purpose as string) || '';
  const userId = (metadata.userId as string) || '';

  const storedUSD = Number(metadata.amountUSD);
  const amountUSD = Number.isFinite(storedUSD) && storedUSD > 0
    ? Math.round(storedUSD * 100) / 100
    : await toUSD(supabase, amountMinor, currency);

  console.log('[webhook] charge.success', { reference, purpose, userId, amountUSD, currency });

  if (!purpose) {
    return { ok: false, error: 'Missing metadata.purpose' };
  }

  // ── WALLET DEPOSIT ──
  if (purpose === 'wallet_deposit') {
    if (!userId) {
      return { ok: false, error: 'Missing userId for wallet_deposit' };
    }

    const { data: result, error } = await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount_usd: amountUSD,
      p_reference: reference,
      p_description: 'Wallet deposit via Paystack',
    });

    if (error) {
      console.error('[webhook] credit_wallet RPC failed:', error);
      return { ok: false, error: `RPC failed: ${error.message}` };
    }

    console.log('[webhook] wallet credited:', result);
    return { ok: true };
  }

  // ── SIGNAL PURCHASE ──
  if (purpose === 'signal_purchase') {
    if (!userId) {
      return { ok: false, error: 'Missing userId for signal_purchase' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_signals: true })
      .eq('id', userId);

    if (profileError) {
      console.error('[webhook] profile update failed:', profileError);
      return { ok: false, error: `Profile update failed: ${profileError.message}` };
    }

    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        email: data.customer?.email ?? null,
        reference,
        amount: amountMinor / 100,
        currency,
        plan: (metadata.plan as string) || (metadata.planLabel as string) || 'Signal Package',
        signal_type: (metadata.signalType as string) || (metadata.planType as string) || 'football',
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error('[webhook] purchases insert failed:', purchaseError);
    }

    console.log('[webhook] signal purchase completed for user:', userId);
    return { ok: true };
  }

  // ── TREASURY FUNDING (admin-only) ──
  if (purpose === 'treasury_funding') {
    const adminEmail = (metadata.adminEmail as string) || 'system';
    const cur = ((metadata.currency as string) || 'KES').toUpperCase();
    const treasuryAmount = Number(metadata.amount) || (amountMinor / 100);

    const { data: result, error } = await supabase.rpc('treasury_fund', {
      p_currency: cur,
      p_amount: treasuryAmount,
      p_reference: reference,
      p_description: `Treasury funding via Paystack (admin ${adminEmail})`,
      p_actor: adminEmail,
    });

    if (error) {
      console.error('[webhook] treasury_fund RPC failed:', error);
      return { ok: false, error: `RPC failed: ${error.message}` };
    }

    console.log('[webhook] treasury funded:', result);
    return { ok: true };
  }

  return { ok: false, error: `Unknown purpose: ${purpose}` };
}

// ------------------------------------------------------------
async function toUSD(
  supabase: ReturnType<typeof createClient>,
  amountMinor: number,
  currency: string
): Promise<number> {
  const amount = amountMinor / 100;

  if (currency === 'USD') return amount;

  if (currency === 'KES') {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'usd_to_kes_rate')
      .single();

    const rate = (data?.value as { rate?: number } | null)?.rate ?? 129.5;
    return Math.round((amount / rate) * 100) / 100;
  }

  console.error('[webhook] unknown currency:', currency);
  return amount;
}
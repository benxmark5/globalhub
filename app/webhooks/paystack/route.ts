// app/webhooks/paystack/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  ?? process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  try {
    // 1. Config check
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[webhook] Missing env keys');
      return new NextResponse('Config error', { status: 500 });
    }

    // 2. Verify signature
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

    // 3. Idempotency: dedupe by (reference, event_type)
    const reference: string = event.data?.reference ?? '';
    if (!reference) {
      return NextResponse.json({ ok: true, ignored: 'no reference' });
    }

    const { error: dedupeError } = await supabase
      .from('payment_events')
      .insert({
        reference,
        event_type: event.event,
        payload: event,
      });

    if (dedupeError) {
      if ((dedupeError as { code?: string }).code === '23505') {
        console.log('[webhook] duplicate — already processed:', reference);
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error('[webhook] dedupe insert failed:', dedupeError);
      return new NextResponse('Dedupe failed', { status: 500 });
    }

    // 4. Route by event type
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(supabase, event.data);
        break;

      // Transfer events (payments going OUT) — added later in Step 7
      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        console.log('[webhook] transfer event received (handled later):', event.event);
        break;

      default:
        console.log('[webhook] unhandled event:', event.event);
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
    amount: number;         // in minor units (kobo/cents)
    currency: string;
    customer?: { email?: string };
    metadata?: Record<string, unknown>;
  }
) {
  const reference = data.reference;
  const amountMinor = data.amount ?? 0;
  const currency = (data.currency || 'KES').toUpperCase();
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;

  const purpose = (metadata.purpose as string) || '';
  const userId = (metadata.userId as string) || '';

  // Convert to USD using platform_settings FX rate
    // Prefer the USD amount the user actually agreed to pay (stored at initiate time).
  // Fall back to FX conversion only if metadata is missing (legacy payments).
  const storedUSD = Number((metadata as Record<string, unknown>).amountUSD);
  const amountUSD = Number.isFinite(storedUSD) && storedUSD > 0
    ? Math.round(storedUSD * 100) / 100
    : await toUSD(supabase, amountMinor, currency);

  console.log('[webhook] charge.success', { reference, purpose, userId, amountUSD, currency });

  if (!purpose) {
    console.warn('[webhook] charge.success missing metadata.purpose — reference:', reference);
    return;
  }

  // ----------------------------------------------------------
  // A. WALLET DEPOSIT — credit the wallet atomically
  // ----------------------------------------------------------
  if (purpose === 'wallet_deposit') {
    if (!userId) {
      console.error('[webhook] wallet_deposit missing userId — ref:', reference);
      return;
    }

    const { data: result, error } = await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount_usd: amountUSD,
      p_reference: reference,
      p_description: 'Wallet deposit via Paystack',
    });

    if (error) {
      console.error('[webhook] credit_wallet RPC failed:', error);
      throw error;
    }

    console.log('[webhook] wallet credited:', result);
    return;
  }

  // ----------------------------------------------------------
  // B. SIGNAL PURCHASE — activate signals on profile
  // ----------------------------------------------------------
  if (purpose === 'signal_purchase') {
    if (!userId) {
      console.error('[webhook] signal_purchase missing userId — ref:', reference);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_signals: true })
      .eq('id', userId);

    if (profileError) {
      console.error('[webhook] profile update failed:', profileError);
      throw profileError;
    }

    // Also record in purchases for admin metrics
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
      // Don't throw — signals already activated, don't retry the whole event
    }

    console.log('[webhook] signal purchase completed for user:', userId);
    return;
  }

  // ----------------------------------------------------------
  // C. UNKNOWN PURPOSE — log, don't guess
  // ----------------------------------------------------------
  console.warn('[webhook] unknown purpose:', purpose, '— reference:', reference);
}

// ------------------------------------------------------------
// Convert Paystack minor units → USD via platform_settings
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

  // Unknown currency — log and return best-effort
  console.error('[webhook] unknown currency for conversion:', currency);
  return amount;
}
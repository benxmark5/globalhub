// app/api/wallet/deposit/verify/route.ts
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('[wallet/deposit/verify] missing env');
      return Response.json({ success: false, error: 'Config missing' }, { status: 500 });
    }

    const body = await req.json();
    const reference: string | undefined = body?.reference;

    if (!reference) {
      return Response.json(
        { success: false, error: 'Reference required' },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ----------------------------------------------------------
    // 1. Verify with Paystack (server-side, never trust the browser)
    // ----------------------------------------------------------
    const psRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        cache: 'no-store',
      }
    );
    const psData = await psRes.json();

    if (!psData.status || psData.data?.status !== 'success') {
      console.warn('[wallet/deposit/verify] not paid:', reference, psData.data?.status);
      return Response.json({
        success: false,
        message: psData.data?.status || 'Not paid',
      });
    }

    const metadata = (psData.data?.metadata ?? {}) as Record<string, unknown>;
    const userId = (metadata.userId as string) || '';
    const purpose = (metadata.purpose as string) || '';

    // ----------------------------------------------------------
    // 2. Must be a wallet deposit
    // ----------------------------------------------------------
    if (purpose !== 'wallet_deposit') {
      console.warn('[wallet/deposit/verify] wrong purpose:', purpose, 'ref:', reference);
      return Response.json({
        success: false,
        error: 'Not a wallet deposit reference',
      }, { status: 400 });
    }

    if (!userId) {
      console.error('[wallet/deposit/verify] missing userId in metadata');
      return Response.json({
        success: false,
        error: 'Malformed payment metadata',
      }, { status: 400 });
    }

    // ----------------------------------------------------------
        // ----------------------------------------------------------
    // 3. Amount in USD
    //    Prefer metadata.amountUSD (what the user agreed to pay).
    //    Fall back to FX conversion only if metadata is missing.
    // ----------------------------------------------------------
    const amountMinor = psData.data.amount ?? 0;
    const currency = (psData.data.currency || 'KES').toUpperCase();
    const storedUSD = Number((metadata as Record<string, unknown>).amountUSD);
    const amountUSD = Number.isFinite(storedUSD) && storedUSD > 0
      ? Math.round(storedUSD * 100) / 100
      : await toUSD(supabase, amountMinor, currency);

    // ----------------------------------------------------------
    // 4. Call credit_wallet — idempotent, so safe if webhook beat us
    // ----------------------------------------------------------
    const { data: result, error: rpcError } = await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount_usd: amountUSD,
      p_reference: reference,
      p_description: 'Wallet deposit via Paystack',
    });

    if (rpcError) {
      console.error('[wallet/deposit/verify] credit_wallet failed:', rpcError);
      return Response.json({
        success: false,
        error: 'Could not credit wallet',
      }, { status: 500 });
    }

    const wasAlreadyProcessed = Boolean(
      (result as { already_processed?: boolean } | null)?.already_processed
    );

    console.log('[wallet/deposit/verify]', reference, {
      credited: !wasAlreadyProcessed,
      amountUSD,
    });

    return Response.json({
      success: true,
      reference,
      amount: amountUSD,
      alreadyProcessed: wasAlreadyProcessed,
      newBalance: (result as { new_balance?: number } | null)?.new_balance ?? null,
    });
  } catch (err) {
    console.error('[wallet/deposit/verify] fatal:', err);
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Verify failed' },
      { status: 500 }
    );
  }
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

  if (currency === 'USD') return Math.round(amount * 100) / 100;

  if (currency === 'KES') {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'usd_to_kes_rate')
      .single();

    const rate = (data?.value as { rate?: number } | null)?.rate ?? 129.5;
    return Math.round((amount / rate) * 100) / 100;
  }

  console.warn('[wallet/deposit/verify] unknown currency:', currency);
  return Math.round(amount * 100) / 100;
}
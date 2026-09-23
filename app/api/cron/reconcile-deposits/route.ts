// app/api/cron/reconcile-deposits/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  // ── Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET> ──
  const auth = req.headers.get('authorization');
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Config missing' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const results = {
    scanned: 0,
    credited: 0,
    failed: 0,
    still_pending: 0,
    errors: [] as string[],
  };

  try {
    // ── Find pending deposits older than 5 minutes ──
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pending, error: fetchError } = await supabase
      .from('wallet_transactions')
      .select('id, user_id, amount, currency, reference, created_at')
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .lt('created_at', fiveMinAgo)
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      return NextResponse.json(
        { error: `Fetch failed: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ ...results, message: 'No pending deposits' });
    }

    results.scanned = pending.length;

    // ── Process each ──
    for (const tx of pending) {
      try {
        const psRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(tx.reference)}`,
          { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }, cache: 'no-store' }
        );
        const psData = await psRes.json();

        const status = psData?.data?.status;

        if (status === 'success') {
          // ── Paystack confirms: credit the wallet ──
          const metadata = (psData.data?.metadata ?? {}) as Record<string, unknown>;
          const storedUSD = Number(metadata.amountUSD);
          const amountUSD = Number.isFinite(storedUSD) && storedUSD > 0
            ? Math.round(storedUSD * 100) / 100
            : Number(tx.amount);

          const { data: rpcResult, error: rpcError } = await supabase.rpc('credit_wallet', {
            p_user_id: tx.user_id,
            p_amount_usd: amountUSD,
            p_reference: tx.reference,
            p_description: 'Wallet deposit (reconciled)',
          });

          if (rpcError) {
            results.errors.push(`${tx.reference}: RPC error: ${rpcError.message}`);
            continue;
          }

          results.credited += 1;
          console.log(`[reconcile] credited ${tx.reference} ($${amountUSD}) ->`, rpcResult);
        } else if (status === 'failed' || status === 'abandoned' || status === 'reversed') {
          // ── Paystack says it failed — mark it ──
          await supabase
            .from('wallet_transactions')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', tx.id);

          results.failed += 1;
          console.log(`[reconcile] marked failed ${tx.reference} (Paystack: ${status})`);
        } else {
          // ── Still pending on Paystack ──
          // If it's older than 24h, expire it
          if (tx.created_at < twentyFourHoursAgo) {
            await supabase
              .from('wallet_transactions')
              .update({ status: 'failed', updated_at: new Date().toISOString() })
              .eq('id', tx.id);

            results.failed += 1;
            console.log(`[reconcile] expired 24h+ ${tx.reference}`);
          } else {
            results.still_pending += 1;
            console.log(`[reconcile] still pending ${tx.reference} (Paystack: ${status})`);
          }
        }
      } catch (err) {
        results.errors.push(
          `${tx.reference}: ${err instanceof Error ? err.message : 'unknown'}`
        );
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error', ...results },
      { status: 500 }
    );
  }
}
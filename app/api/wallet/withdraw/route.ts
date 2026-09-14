// app/api/wallet/withdraw/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Config missing' }, { status: 500 });
    }

    // ── AUTH ──
    const auth = await getAuthUser();
    if (!auth.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.id;

    const body = await req.json();
    const { amount, payoutMethod, payoutName, payoutIdentifier } = body;

    if (!amount || !payoutMethod || !payoutName || !payoutIdentifier) {
      return Response.json(
        { error: 'amount, payoutMethod, payoutName, payoutIdentifier required' },
        { status: 400 }
      );
    }

    const amountUSD = Number(amount);
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Atomic RPC: locks wallet, checks balance, deducts, reserves ──
    const { data: result, error: rpcError } = await supabase.rpc('create_withdrawal', {
      p_user_id: userId,
      p_amount_usd: amountUSD,
      p_payout_method: payoutMethod,
      p_payout_name: payoutName,
      p_payout_identifier: payoutIdentifier,
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

    // Best-effort notification (already inserted inside RPC for in-app)
    await supabase.from('activity_feed').insert({
      type: 'withdrawal_request',
      title: 'New withdrawal request',
      description: `$${amountUSD.toFixed(2)} via ${payoutMethod} — Ref: ${r.reference}`,
      country: 'US',
      country_flag: '💸',
      metadata: { userId, amount: amountUSD, payoutMethod, reference: r.reference },
    });

    return Response.json({
      success: true,
      reference: r.reference,
      expiresInSeconds: r.expires_in_seconds ?? 3600,
    });
  } catch (error) {
    console.error('[wallet/withdraw] fatal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
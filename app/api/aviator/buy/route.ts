// app/api/aviator/buy/route.ts
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
      return Response.json({ error: 'Please sign in to buy' }, { status: 401 });
    }
    const userId = auth.user.id;

    const body = await req.json();
    const batchId: string | undefined = body?.batchId;
    if (!batchId) {
      return Response.json({ error: 'batchId is required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── LOAD BATCH (server-authoritative price) ──
    const { data: batch, error: bErr } = await supabase
      .from('aviator_batches')
      .select('id, status, price_usd, name, expires_at')
      .eq('id', batchId)
      .single();

    if (bErr || !batch) {
      return Response.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.status !== 'published') {
      return Response.json({ error: 'This pack is not available' }, { status: 400 });
    }

    if (batch.expires_at && new Date(batch.expires_at).getTime() < Date.now()) {
      return Response.json({ error: 'This pack has expired' }, { status: 400 });
    }

    // ── ALREADY PURCHASED? ──
    const { data: existing } = await supabase
      .from('aviator_purchases')
      .select('id, reference')
      .eq('user_id', userId)
      .eq('batch_id', batchId)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        alreadyPurchased: true,
        reference: existing.reference,
      });
    }

    // ── WALLET CHECK ──
    const { data: wallet, error: wErr } = await supabase
      .from('wallets')
      .select('id, available_balance')
      .eq('user_id', userId)
      .single();

    if (wErr || !wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const price = Number(batch.price_usd);
    const balance = Number(wallet.available_balance ?? 0);

    if (balance < price) {
      return Response.json(
        { error: `Insufficient balance. You have $${balance.toFixed(2)} but need $${price.toFixed(2)}.` },
        { status: 400 }
      );
    }

    const reference = `AV_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // ── Deduct wallet (optimistic lock) ──
    const { error: deductErr } = await supabase
      .from('wallets')
      .update({
        available_balance: balance - price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)
      .eq('available_balance', balance);

    if (deductErr) {
      console.error('[aviator/buy] wallet deduct failed:', deductErr);
      return Response.json({ error: 'Failed to deduct wallet' }, { status: 500 });
    }

    // ── Insert purchase ──
    const { error: purchaseErr } = await supabase
      .from('aviator_purchases')
      .insert({
        user_id: userId,
        batch_id: batchId,
        amount_usd: price,
        reference,
        status: 'completed',
      });

    if (purchaseErr) {
      // Rollback
      await supabase
        .from('wallets')
        .update({ available_balance: balance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);
      console.error('[aviator/buy] purchase insert failed:', purchaseErr);
      return Response.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    // ── Log transaction ──
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      wallet_id: wallet.id,
      type: 'purchase',
      amount: price,
      currency: 'USD',
      status: 'completed',
      reference,
      description: `Aviator pack: ${batch.name ?? 'Unnamed'}`,
      metadata: { batch_id: batchId, market_kind: 'aviator' },
    });

    // ── Notification ──
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'aviator_purchase',
      title: 'Aviator pack purchased',
      message: `You bought "${batch.name ?? 'Aviator pack'}" for $${price.toFixed(2)}`,
      metadata: { batch_id: batchId, reference },
    });

    return Response.json({
      success: true,
      reference,
      amount_usd: price,
      new_balance: balance - price,
    });
  } catch (e) {
    console.error('[aviator/buy] fatal:', e);
    return Response.json(
      { error: e instanceof Error ? e.message : 'Purchase failed' },
      { status: 500 }
    );
  }
}
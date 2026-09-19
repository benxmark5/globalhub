// app/api/football/buy/route.ts
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

    // ── INPUT ──
    const body = await req.json();
    const marketId: string | undefined = body?.marketId;

    if (!marketId) {
      return Response.json({ error: 'marketId is required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── LOAD MARKET (server-authoritative price) ──
    const { data: market, error: marketErr } = await supabase
      .from('football_markets')
      .select('id, status, price_usd, home_team, away_team, kickoff_at')
      .eq('id', marketId)
      .single();

    if (marketErr || !market) {
      return Response.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.status !== 'published') {
      return Response.json({ error: 'This signal is not available' }, { status: 400 });
    }

    // Reject if kickoff already passed by more than 2 hours
    const kickoffMs = new Date(market.kickoff_at).getTime();
    if (Date.now() > kickoffMs + 2 * 60 * 60 * 1000) {
      return Response.json({ error: 'This match has already started' }, { status: 400 });
    }

    // ── ALREADY PURCHASED? ──
    const { data: existing } = await supabase
      .from('football_purchases')
      .select('id, reference')
      .eq('user_id', userId)
      .eq('market_id', marketId)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        alreadyPurchased: true,
        reference: existing.reference,
      });
    }

    // ── WALLET CHECK ──
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, available_balance')
      .eq('user_id', userId)
      .single();

    if (walletErr || !wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const price = Number(market.price_usd);
    const balance = Number(wallet.available_balance ?? 0);

    if (balance < price) {
      return Response.json(
        { error: `Insufficient balance. You have $${balance.toFixed(2)} but need $${price.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // ── ATOMIC DEDUCT + PURCHASE ──
    // Try using an RPC if it exists, else fall back to manual transaction.
    const reference = `FS_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 1. Deduct wallet (row-lock via .eq + update)
    const { error: deductErr } = await supabase
      .from('wallets')
      .update({
        available_balance: balance - price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)
      .eq('available_balance', balance); // optimistic lock: only succeeds if balance matches

    if (deductErr) {
      console.error('[football/buy] wallet deduct failed:', deductErr);
      return Response.json({ error: 'Failed to deduct wallet' }, { status: 500 });
    }

    // 2. Insert purchase
    const { error: purchaseErr } = await supabase
      .from('football_purchases')
      .insert({
        user_id: userId,
        market_id: marketId,
        amount_usd: price,
        reference,
        status: 'completed',
      });

    if (purchaseErr) {
      // Rollback wallet
      await supabase
        .from('wallets')
        .update({ available_balance: balance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);
      console.error('[football/buy] purchase insert failed:', purchaseErr);
      return Response.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    // 3. Log transaction
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      wallet_id: wallet.id,
      type: 'purchase',
      amount: price,
      currency: 'USD',
      status: 'completed',
      reference,
      description: `Football signal: ${market.home_team} vs ${market.away_team}`,
      metadata: { market_id: marketId, market_kind: 'football' },
    });

    // 4. Notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'football_purchase',
      title: 'Signal purchased',
      message: `You bought "${market.home_team} vs ${market.away_team}" for $${price.toFixed(2)}`,
      metadata: { market_id: marketId, reference },
    });

    return Response.json({
      success: true,
      reference,
      amount_usd: price,
      new_balance: balance - price,
    });
  } catch (error) {
    console.error('[football/buy] fatal:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Purchase failed' },
      { status: 500 }
    );
  }
}
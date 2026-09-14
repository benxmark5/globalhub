// app/api/wallet/balance/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function GET(_req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Config missing' }, { status: 500 });
    }

    // ── AUTH: user comes from the session cookie, NOT from the query string ──
    const auth = await getAuthUser();
    if (!auth.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.id;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Ensure wallet exists
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: insertError } = await supabase
        .from('wallets')
        .insert({ user_id: userId })
        .select()
        .single();
      if (insertError) throw insertError;
      wallet = newWallet;
    }

    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return Response.json({
      wallet,
      transactions: transactions ?? [],
      notifications: notifications ?? [],
    });
  } catch (error) {
    console.error('[wallet/balance] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
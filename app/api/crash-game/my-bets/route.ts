import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return Response.json({ bets: [] });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: bets } = await admin
    .from('game_bets')
    .select('id, round_id, amount_usd, status, cashout_multiplier, payout_usd, placed_at')
    .eq('user_id', user.id)
    .order('placed_at', { ascending: false })
    .limit(20);

  const roundIds = [...new Set(bets?.map(b => b.round_id) || [])];
  const { data: rounds } = await admin
    .from('game_rounds')
    .select('id, round_number')
    .in('id', roundIds);

  const roundMap = new Map(rounds?.map(r => [r.id, r.round_number]) || []);

  const result = bets?.map(bet => ({
    id: bet.id,
    roundNumber: roundMap.get(bet.round_id) || 0,
    amount: bet.amount_usd,
    status: bet.status,
    cashoutMultiplier: bet.cashout_multiplier,
    payout: bet.payout_usd,
    placedAt: bet.placed_at,
  })) || [];

  return Response.json({ bets: result });
}
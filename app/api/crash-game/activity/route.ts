import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: bets } = await admin
    .from('game_bets')
    .select('id, user_id, round_id, amount_usd, status, cashout_multiplier, payout_usd, placed_at')
    .order('placed_at', { ascending: false })
    .limit(50);

  if (!bets) return Response.json({ activity: [] });

  const roundIds = [...new Set(bets.map(b => b.round_id))];
  const { data: rounds } = await admin
    .from('game_rounds')
    .select('id, round_number')
    .in('id', roundIds);

  const roundMap = new Map(rounds?.map(r => [r.id, r.round_number]) || []);

  const activity = bets.map(bet => ({
    id: bet.id,
    playerName: `Player_${bet.user_id.slice(-4)}`,
    roundNumber: roundMap.get(bet.round_id) || 0,
    amount: bet.amount_usd,
    status: bet.status,
    cashoutMultiplier: bet.cashout_multiplier,
    payout: bet.payout_usd,
    time: bet.placed_at,
  }));

  return Response.json({ activity });
}
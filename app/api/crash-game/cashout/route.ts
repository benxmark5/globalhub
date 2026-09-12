import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const GROWTH_RATE = 0.17; // must match game_engine_tick() in Postgres exactly

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });

  const { betId } = await req.json();
  if (!betId) return Response.json({ error: 'Missing bet id' }, { status: 400 });

  const { data: bet } = await admin.from('game_bets').select('round_id').eq('id', betId).eq('user_id', user.id).maybeSingle();
  if (!bet) return Response.json({ error: 'Bet not found' }, { status: 404 });

  const { data: round } = await admin.from('game_rounds').select('running_started_at, status').eq('id', bet.round_id).single();
  if (!round || round.status !== 'running' || !round.running_started_at) {
    return Response.json({ error: 'Round is not currently running' }, { status: 400 });
  }

  // Multiplier is computed here, server-side, from elapsed time — never
  // taken from the client. What the player's screen shows is a local
  // animation; this is the number that actually counts.
  const elapsedSeconds = (Date.now() - new Date(round.running_started_at).getTime()) / 1000;
  const rawMultiplier = Math.exp(GROWTH_RATE * elapsedSeconds);
  const multiplier = Number.isFinite(rawMultiplier) ? Math.round(Math.min(rawMultiplier, 1_000_000) * 100) / 100 : 1;

  const { data: payout, error } = await admin.rpc('cashout_crash_bet', {
    p_bet_id: betId,
    p_user_id: user.id,
    p_multiplier: multiplier,
  });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ payout, multiplier });
}
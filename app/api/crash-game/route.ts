import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

async function getAuthedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(_req: NextRequest) {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const user = await getAuthedUser();

  const { data: round } = await admin
    .from('game_rounds')
    .select('id, round_number, status, server_seed_hash, client_seed, nonce, crash_point, server_seed, betting_ends_at, running_started_at, crashed_at')
    .in('status', ['betting', 'running'])
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Redact the secret fields unless the round has actually crashed —
  // this is the whole reason game_rounds has no public SELECT policy.
  const safeRound = round ? {
    id: round.id,
    round_number: round.round_number,
    status: round.status,
    server_seed_hash: round.server_seed_hash,
    client_seed: round.client_seed,
    nonce: round.nonce,
    betting_ends_at: round.betting_ends_at,
    running_started_at: round.running_started_at,
  } : null;

  const { data: history } = await admin
    .from('game_fairness')
    .select('round_id, round_number, crash_point, server_seed_hash, server_seed, client_seed, nonce, crashed_at')
    .order('round_number', { ascending: false })
    .limit(15);

  let myBet = null;
  if (user && round) {
    const { data: bet } = await admin
      .from('game_bets')
      .select('id, amount_usd, status, cashout_multiplier, payout_usd, auto_cashout_multiplier')
      .eq('round_id', round.id)
      .eq('user_id', user.id)
      .maybeSingle();
    myBet = bet;
  }

  return Response.json({ round: safeRound, history: history || [], myBet, authenticated: !!user });
}
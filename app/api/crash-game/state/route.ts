import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = supabase;
    
    const { data: round } = await admin
      .from('game_rounds')
      .select('*')
      .in('status', ['betting', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // FIX: Added missing fields so the frontend doesn't crash into NaNs
    const safeRound = round || { 
      id: 'pending', 
      round_number: 1,
      status: 'betting', 
      betting_ends_at: new Date(Date.now() + 5000).toISOString(),
      running_started_at: null,
      server_seed_hash: 'pending'
    };

    const { data: history } = await admin
      .from('game_rounds')
      .select('round_id, crash_point')
      .eq('status', 'crashed')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: publicBets } = await admin
      .from('game_bets')
      .select('*')
      .eq('round_id', safeRound.id);

    let balance = 0;
let aviatorBalance = 0;
if (user) {
  const { data: wallet } = await admin
    .from('wallets')
    .select('available_balance, aviator_balance')
    .eq('user_id', user.id)
    .maybeSingle();
  balance = Number(wallet?.available_balance ?? 0);
  aviatorBalance = Number(wallet?.aviator_balance ?? 0);
}
        const myBets: Record<number, any> = { 1: null, 2: null };
    if (user && round) {
      const { data: bets } = await admin
        .from('game_bets')
        .select('id, amount_usd, status, cashout_multiplier, payout_usd, auto_cashout_multiplier, slot')
        .eq('round_id', round.id)
        .eq('user_id', user.id);
      for (const b of bets || []) myBets[b.slot] = b;
    }

    return Response.json({
      round: safeRound,
      history: history || [],
      myBets,
      publicBets: publicBets || [],
      balance,
      aviatorBalance,
      authenticated: !!user,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Sign in to place a bet' }, { status: 401 });
  }

  const { roundId, amount, autoCashout } = await req.json();
  if (!roundId || !amount || Number(amount) <= 0) {
    return Response.json({ error: 'Invalid bet' }, { status: 400 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { data, error } = await admin.rpc('place_crash_bet', {
    p_user_id: user.id,
    p_round_id: roundId,
    p_amount: Number(amount),
    p_auto_cashout: autoCashout ? Number(autoCashout) : null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ betId: data });
}
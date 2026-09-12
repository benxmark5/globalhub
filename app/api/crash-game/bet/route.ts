import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roundId, amount, autoCashout, slot } = await req.json();

    const { data, error } = await supabase.rpc('place_crash_bet', {
      p_user_id: user.id,
      p_round_id: roundId,
      p_amount: Number(amount),
      p_auto_cashout: autoCashout ? Number(autoCashout) : null,
      p_slot: slot === 2 ? 2 : 1,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, betId: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

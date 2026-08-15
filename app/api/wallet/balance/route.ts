import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError) throw walletError;

    let wallet = walletData;

    if (!wallet) {
      const { data: newWallet, error: insertError } = await supabase
        .from('wallets')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) throw insertError;
      wallet = newWallet;
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) throw transactionsError;

    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationsError) throw notificationsError;

    return Response.json({
      wallet,
      transactions: transactions || [],
      notifications: notifications || [],
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

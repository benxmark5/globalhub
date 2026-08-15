import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, payoutMethod, payoutName, payoutIdentifier } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      return Response.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const numericAmount = Number(amount);

    if (numericAmount < 5) {
      return Response.json({ error: 'Minimum withdrawal is $5' }, { status: 400 });
    }

    if (wallet.available_balance < numericAmount) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const reference = `WD_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await supabase.from('wallets').update({
      available_balance: wallet.available_balance - numericAmount,
      pending_balance: (wallet.pending_balance || 0) + numericAmount,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);

    await supabase.from('withdrawal_requests').insert({
      user_id: userId,
      wallet_id: wallet.id,
      amount: numericAmount,
      currency: 'USD',
      payout_method: payoutMethod,
      payout_name: payoutName,
      payout_identifier: payoutIdentifier,
      status: 'pending',
      reference,
    });

    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      wallet_id: wallet.id,
      type: 'withdrawal',
      amount: numericAmount,
      currency: 'USD',
      status: 'pending',
      reference,
      description: `withdrawal to ${payoutMethod}`,
      metadata: { payoutMethod, payoutName, payoutIdentifier },
    });

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'withdrawal_submitted',
      title: 'Withdrawal submitted',
      message: `Your $${numericAmount} withdrawal request is pending approval`,
      metadata: { reference, amount: numericAmount },
    });

    await supabase.from('activity_feed').insert({
      type: 'withdrawal_request',
      title: 'New withdrawal request',
      description: `${numericAmount} via ${payoutMethod} - Reference: ${reference}`,
      country: 'US',
      country_flag: '💸',
      metadata: { userId, amount: numericAmount, payoutMethod, reference },
    });

    return Response.json({ success: true, reference });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Withdrawal failed' }, { status: 500 });
  }
}
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return Response.json(
        { error: 'Reference required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return Response.json(
        { error: 'Payment not configured' },
        { status: 500 }
      );
    }

    // Verify with Paystack
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );

    const data = await res.json();

    if (!data.status || data.data?.status !== 'success') {
      return Response.json({
        paid: false,
        message: data.data?.status || 'Not paid'
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check if already processed
    const { data: existing } = await supabase
      .from('purchases')
      .select('*')
      .eq('reference', reference)
      .single();

    if (existing?.status === 'completed') {
      return Response.json({
        paid: true,
        reference,
        amount: existing.amount,
        currency: existing.currency,
        alreadyProcessed: true
      });
    }

    // Update to completed
    await supabase
      .from('purchases')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('reference', reference);

    // Get user email
    const { data: userData } = await supabase.auth.admin
      .getUserById(existing?.user_id || '');

    const userEmail = userData?.user?.email ||
      data.data?.customer?.email || '';
    const userName = userData?.user?.user_metadata?.full_name
      || 'Valued Customer';

    // Send receipt email
    if (userEmail && existing) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

      fetch(`${appUrl}/api/send-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          reference,
          signalType: existing.signal_type || 'football',
          signalsCount: existing.signals_count || 1,
          bonusSignals: existing.bonus_signals || 0,
          amount: existing.amount,
          currency: existing.currency || 'KES',
          planLabel: existing.plan || 'Signal Package',
        }),
      }).catch(e => console.error('Email send error:', e));
    }

    return Response.json({
      paid: true,
      reference,
      amount: data.data.amount / 100,
      currency: data.data.currency,
    });

  } catch (error) {
    console.error('Verify error:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
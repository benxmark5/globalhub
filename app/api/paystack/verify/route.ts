import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return Response.json(
        { error: 'Reference required' }, { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return Response.json(
        { error: 'Not configured' }, { status: 500 }
      );
    }

    // Verify with Paystack
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
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
        paid: true, reference,
        amount: existing.amount,
        currency: existing.currency,
        alreadyProcessed: true
      });
    }

    // Mark as completed
    const { data: updated } = await supabase
      .from('purchases')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        email_sent: false,
      })
      .eq('reference', reference)
      .select()
      .single();

    // Get user email from Paystack response
    const userEmail = data.data?.customer?.email ||
      existing?.email || '';
    const userName = existing?.user_id
      ? 'Valued Customer' : 'Customer';

    // Send receipt email immediately
    if (userEmail && updated && !existing?.email_sent) {
      // Update email_sent flag
      await supabase
        .from('purchases')
        .update({ email_sent: true })
        .eq('reference', reference);

      // Get current signals to include in email
      const { data: signals } = await supabase
        .from('markets')
        .select('*')
        .eq('is_live', true)
        .not('league_name', 'eq',
          updated.signal_type === 'football' ? 'AVIATOR' : 'FOOTBALL'
        )
        .limit(updated.signals_count || 1);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
        'https://globalhub.vercel.app';

      // Send receipt with signals link
      fetch(`${appUrl}/api/send-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          reference,
          signalType: updated.signal_type || 'football',
          signalsCount: updated.signals_count || 1,
          bonusSignals: updated.bonus_signals || 0,
          amount: updated.amount,
          currency: updated.currency || 'KES',
          planLabel: updated.plan || 'Signal Package',
          appUrl,
          signalsLink: `${appUrl}/${updated.signal_type}`,
          availableSignals: signals?.length || 0,
        }),
      }).catch(e => console.error('Email error:', e));
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
      { error: String(error) }, { status: 500 }
    );
  }
}
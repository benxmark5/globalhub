import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const {
      email, amount, userId,
      planType, signalsCount,
      bonusSignals, planLabel
    } = await request.json();

    // Check all env vars
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!paystackKey) {
      return Response.json(
        { error: 'Paystack not configured. Add PAYSTACK_SECRET_KEY to .env.local' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceKey) {
      return Response.json(
        { error: 'Database not configured. Add SUPABASE_SERVICE_KEY to .env.local' },
        { status: 500 }
      );
    }

    const reference = `gh-${Date.now()}-${Math.random()
      .toString(36).substr(2, 8)}`;

    // Save pending purchase
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error: dbError } = await supabase
      .from('purchases')
      .insert([{
        user_id: userId,
        amount,
        currency: 'KES',
        reference,
        plan: planLabel,
        signal_type: planType,
        signals_count: signalsCount,
        bonus_signals: bonusSignals || 0,
        status: 'pending',
        expires_at: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      }]);

    if (dbError) {
      console.error('DB Error:', dbError);
      return Response.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Initialize Paystack transaction
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const res = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount * 100,
          reference,
          currency: 'KES',
          callback_url: `${appUrl}/payment/verify?reference=${reference}`,
          metadata: {
            plan: planLabel,
            signal_type: planType,
            signals_count: signalsCount,
            user_id: userId,
            custom_fields: [
              {
                display_name: 'Plan',
                variable_name: 'plan',
                value: planLabel,
              }
            ]
          }
        }),
      }
    );

    const data = await res.json();

    if (!data.status) {
      return Response.json(
        { error: data.message || 'Paystack initialization failed' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });

  } catch (error) {
    console.error('Initialize error:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
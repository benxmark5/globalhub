export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 1. Safe extraction of variables inside the execution block (avoids build-time evaluation)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !paystackSecretKey) {
      console.error("CRITICAL ERROR: Missing environment keys inside Vercel execution context.");
      return new NextResponse('Configuration missing keys', { status: 500 });
    }

    // 2. Safely initialize client only when the live webhook is hit
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    
    // 3. Verify webhook signature for absolute platform security
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers.get('x-paystack-signature')) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 4. Process successful payment transactions
    if (event.event === 'charge.success') {
      const sessionData = event.data;
      const customerEmail = sessionData.customer.email;
      const amountPaid = sessionData.amount / 100; // Convert minor units to standard float
      const currency = sessionData.currency || 'KES';
      
      const metadata = sessionData.metadata || {}; 
      const signalType = metadata.signal_type || metadata.type || 'aviator'; 
      const planName = metadata.plan || 'Signal Package';

      console.log(`Verified payment from ${customerEmail} for ${currency} ${amountPaid}.`);

      // 5. Handle Instant Wallet Balance Top-Up vs Signal Package Update
      if (signalType === 'deposit') {
        // Instantly increment user wallet balance using Supabase RPC
        const { error: balanceError } = await supabase.rpc('increment_balance', {
          user_email: customerEmail,
          amount_to_add: amountPaid
        });

        if (balanceError) {
          console.error('Error updating user wallet balance:', balanceError);
          throw balanceError;
        }
      } else {
        // Update Customer profile on public side for active signals
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ active_signals: true })
          .eq('email', customerEmail);

        if (profileError) {
          console.error('Error updating public client profile:', profileError);
          throw profileError;
        }
      }

      // 6. Record the item directly into the 'purchases' table for Admin Dashboard metrics
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            email: customerEmail,
            amount: amountPaid,
            currency: currency,
            plan: planName,
            signal_type: signalType,
            status: 'completed', 
            created_at: new Date().toISOString()
          }
        ]);

      if (purchaseError) {
        console.error('Error writing entry to purchases ledger:', purchaseError);
        throw purchaseError;
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook processing failure:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
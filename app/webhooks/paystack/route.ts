export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using environment variables
// Using the Service Role Key allows bypassing RLS policies securely for system webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // 1. Verify webhook signature for absolute platform security and consumer protection
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(rawBody)
      .digest('hex');

    if (hash !== req.headers.get('x-paystack-signature')) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Process successful payment transactions
    if (event.event === 'charge.success') {
      const sessionData = event.data;
      const customerEmail = sessionData.customer.email;
      const amountPaid = sessionData.amount / 100; // Convert local currency minor units (kobo/cents) to standard float
      const currency = sessionData.currency || 'KES';
      
      // Safe fallback extraction of custom metadata passed during frontend checkout initialize stage
      const metadata = sessionData.metadata || {}; 
      const signalType = metadata.signal_type || 'aviator'; // Defaults to 'aviator' if none explicitly provided
      const planName = metadata.plan || 'Signal Package';

      console.log(`Verified payment from ${customerEmail} for ${currency} ${amountPaid}. Signal: ${signalType}`);

      // 3. Update Customer profile on public side to instantly flip '0 Active' view counters
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          active_signals: true,
        })
        .eq('email', customerEmail);

      if (profileError) {
        console.error('Error updating public client profile:', profileError);
        throw profileError;
      }

      // 4. Record the item directly into the 'purchases' table to naturally populate your Admin Dashboard metrics
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            email: customerEmail,
            amount: amountPaid,
            currency: currency,
            plan: planName,
            signal_type: signalType, // Expects 'aviator' or 'football'
            status: 'completed',    // Matches the lowercase '.filter(p => p.status === "completed")' rule in Admin Page
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
    console.error('Webhook processing pipeline execution failure:', error);
    return new NextResponse('Webhook error processing failed', { status: 500 });
  }
}
// Forced clean push update for Vercel rebuild
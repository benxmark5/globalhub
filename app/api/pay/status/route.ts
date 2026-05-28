import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return Response.json({ paid: false, error: "Missing reference" }, { status: 400 });
    }

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Fetch the transaction status from your Supabase table
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('reference', reference)
      .maybeSingle(); // Prevents throwing a 406 crash if the reference doesn't exist yet

    if (error || !data) {
      return Response.json({ paid: false, error: "Purchase record not found" }, { status: 404 });
    }

    const paid = data.status === 'completed' || data.status === 'success';

    // Send receipt if just paid
    if (paid && !data.email_sent) {
      // 1. Update DB first so we don't accidentally double-send if multiple polling requests hit simultaneously
      await supabase
        .from('purchases')
        .update({ email_sent: true })
        .eq('reference', reference);

      // 2. Trigger receipt email safely using fallback for application URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      
      try {
        await fetch(`${appUrl}/api/send-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.phone || '', // Falls back to phone if email isn't tied to standard schemas
            reference: reference,
            signalType: data.signal_type,
            signalsCount: data.signals_count,
            amount: data.amount,
            currency: data.currency,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // We catch this inside its own block so a failing email service doesn't break the payment validation screen
      }
    }

    return Response.json({
      paid,
      purchase: data
    });

  } catch (error) {
    console.error("Status check route error:", error); // Fixes the ESLint 'error is defined but never used' rule
    return Response.json({ paid: false, error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Payment callback:', body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Update purchase status
    if (body.status === 'SUCCESS' || 
        body.ResultCode === 0) {
      const reference = body.external_reference || 
        body.CheckoutRequestID;

      await supabase
        .from('purchases')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('reference', reference);
    }

    return Response.json({ success: true });

  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
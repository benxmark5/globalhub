import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const data = await res.json();

    if (!data.status || data.data?.status !== 'success') {
      return Response.json({ success: false, message: 'Payment not confirmed' });
    }

    const supabase: any = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: order } = await supabase
      .from('ticket_orders')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (!order || order.status === 'confirmed') {
      return Response.json({ success: true, already: true });
    }

    // Confirm order
    await supabase.from('ticket_orders').update({
      status: 'confirmed',
      payment_status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', order.id);

    // Get tier
    const { data: tier } = await supabase
      .from('ticket_tiers').select('*').eq('id', order.tier_id).single();

    // Issue tickets
    const { default: issueTicketsFn } = { default: async () => {} };

    // Inline issue
    const tickets: {
  ticket_number: string;
  order_id: string;
  user_id: string;
  event_id: string;
  tier_id: string;
  section: string;
  row_number: string;
  seat_number: string;
  gate: string;
  qr_data: string;
  barcode_data: string;
  status: string;
}[] = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketSeq = Date.now() + i;
      const ticketNum = `GH-${new Date().getFullYear()}-${String(ticketSeq).slice(-6)}`;
      tickets.push({
        ticket_number: ticketNum,
        order_id: order.id,
        user_id: order.user_id,
        event_id: order.event_id,
        tier_id: order.tier_id,
        section: tier?.section || 'General',
        row_number: tier?.is_seated ? `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 20))}` : 'GA',
        seat_number: tier?.is_seated ? String(Math.floor(Math.random() * 50) + 1) : 'GA',
        gate: `Gate ${Math.floor(Math.random() * 8) + 1}`,
        qr_data: `GH-TKT-${ticketNum}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        barcode_data: `${order.order_number}-${String(i+1).padStart(3,'0')}`,
        status: 'valid',
      });
    }
    await supabase.from('tickets').insert(tickets);

    if (tier) {
      await supabase.from('ticket_tiers')
        .update({ sold_quantity: (tier.sold_quantity || 0) + order.quantity })
        .eq('id', order.tier_id);
    }

    // Notify
    await supabase.from('notifications').insert({
      user_id: order.user_id,
      type: 'purchase_success',
      title: '🎫 Tickets Confirmed!',
      message: `Your ${order.quantity} ticket${order.quantity > 1 ? 's' : ''} are ready. Check My Tickets!`,
      metadata: { reference, quantity: order.quantity }
    });

    return Response.json({ success: true, quantity: order.quantity });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}




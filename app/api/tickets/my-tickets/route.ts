import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const ticketId = req.nextUrl.searchParams.get('ticketId');
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  if (ticketId) {
    const { data: ticket } = await supabase
      .from('tickets').select('*').eq('id', ticketId).eq('user_id', userId).single();
    if (!ticket) return Response.json({ error: 'Not found' }, { status: 404 });

    const { data: event } = await supabase
      .from('stadium_events').select('*').eq('id', ticket.event_id).single();
    const { data: tier } = await supabase
      .from('ticket_tiers').select('*').eq('id', ticket.tier_id).single();
    const { data: order } = await supabase
      .from('ticket_orders').select('*').eq('id', ticket.order_id).single();

    return Response.json({ ticket, event, tier, order });
  }

  const { data: tickets } = await supabase
    .from('tickets').select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get events for each ticket
  const eventIds = [...new Set((tickets || []).map(t => t.event_id))];
  const { data: events } = await supabase
    .from('stadium_events').select('*').in('id', eventIds);
  const { data: tiers } = await supabase
    .from('ticket_tiers').select('*')
    .in('id', (tickets || []).map(t => t.tier_id));

  return Response.json({
    tickets: tickets || [],
    events: events || [],
    tiers: tiers || [],
  });
}
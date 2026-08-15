import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const featured = req.nextUrl.searchParams.get('featured');
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    const { data: event } = await supabase
      .from('stadium_events').select('*').eq('id', id).single();
    const { data: tiers } = await supabase
      .from('ticket_tiers').select('*')
      .eq('event_id', id).eq('is_active', true)
      .order('sort_order', { ascending: true });
    return Response.json({ event, tiers: tiers || [] });
  }

  let query = supabase.from('stadium_events')
    .select('*').eq('is_published', true)
    .order('event_date', { ascending: true });

  if (featured === 'true') query = query.eq('is_featured', true);

  const { data } = await query;
  return Response.json({ events: data || [] });
}
// app/api/wallet/aviator-transfer/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return Response.json({ error: 'Config missing' }, { status: 500 });
    }

    const auth = await getAuthUser();
    if (!auth.user) {
      return Response.json({ error: 'Please sign in' }, { status: 401 });
    }
    const userId = auth.user.id;

    const body = await req.json();
    const amount = Number(body?.amount);
    const direction = String(body?.direction ?? '');

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (direction !== 'to_aviator' && direction !== 'to_main') {
      return Response.json({ error: 'Invalid direction' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: result, error: rpcErr } = await supabase.rpc('transfer_to_aviator', {
      p_user_id: userId,
      p_amount_usd: amount,
      p_direction: direction,
      p_reference: null,
    });

    if (rpcErr) {
      console.error('[wallet/aviator-transfer] rpc failed:', rpcErr);
      return Response.json({ error: 'Transfer failed' }, { status: 500 });
    }

    const r = result as {
      ok: boolean;
      error?: string;
      reference?: string;
      new_main?: number;
      new_aviator?: number;
    } | null;

    if (!r?.ok) {
      return Response.json({ error: r?.error ?? 'Transfer rejected' }, { status: 400 });
    }

    return Response.json({
      success: true,
      reference: r.reference,
      newMain: r.new_main,
      newAviator: r.new_aviator,
    });
  } catch (e) {
    console.error('[wallet/aviator-transfer] fatal:', e);
    return Response.json(
      { error: e instanceof Error ? e.message : 'Transfer failed' },
      { status: 500 }
    );
  }
}
// app/api/onboarding/marketer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

// Referral code alphabet — excludes 0/O/1/I/L (confusables)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_PREFIX = 'MARK-';
const CODE_LENGTH = 6;

function generateReferralCode(): string {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return CODE_PREFIX + out;
}

const ALLOWED_CHANNELS = new Set([
  'social_media', 'whatsapp', 'youtube', 'blog', 'in_person', 'paid_ads',
]);

const ALLOWED_AUDIENCE = new Set([
  '0-100', '100-1000', '1000-10000', '10000-100000', '100000+',
]);

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
    }

    // Auth
    const cookieStore = await cookies();
    const authClient = createServerClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cs) {
            try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
            catch { /* ignore */ }
          },
        },
      }
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to apply' }, { status: 401 });
    }

    // Parse JSON body
    const body = await req.json().catch(() => ({}));
    const p = body as Record<string, unknown>;

    // Required fields
    const required = ['full_name', 'display_name', 'email', 'city', 'bio', 'audience_size'];
    for (const k of required) {
      const v = p[k];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
      }
    }

    if (String(p.bio).trim().length < 30) {
      return NextResponse.json({ error: 'Bio must be at least 30 characters' }, { status: 400 });
    }

    const channels = Array.isArray(p.channels) ? p.channels : [];
    if (channels.length === 0) {
      return NextResponse.json({ error: 'Select at least one promotion channel' }, { status: 400 });
    }
    for (const ch of channels) {
      if (!ALLOWED_CHANNELS.has(String(ch))) {
        return NextResponse.json({ error: `Invalid channel: ${ch}` }, { status: 400 });
      }
    }

    if (!ALLOWED_AUDIENCE.has(String(p.audience_size))) {
      return NextResponse.json({ error: 'Invalid audience_size' }, { status: 400 });
    }

    // Agreements
    for (const k of ['agree_terms', 'agree_no_fake', 'agree_attribution']) {
      if (p[k] !== true) {
        return NextResponse.json({ error: `Agreement not accepted: ${k}` }, { status: 400 });
      }
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Prevent duplicate
    const { data: existing } = await admin
      .from('marketers')
      .select('id, status, referral_code')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        error: `You already have a marketer application (status: ${existing.status}). Your code is ${existing.referral_code}.`,
      }, { status: 400 });
    }

    // Generate unique referral code
    let code = '';
    let attempts = 0;
    while (attempts < 10) {
      const candidate = generateReferralCode();
      const { data: clash } = await admin
        .from('marketers')
        .select('id')
        .eq('referral_code', candidate)
        .maybeSingle();
      if (!clash) { code = candidate; break; }
      attempts++;
    }
    if (!code) {
      return NextResponse.json({ error: 'Failed to generate a unique referral code. Try again.' }, { status: 500 });
    }

    // Insert marketer row
    const { data: marketer, error: mErr } = await admin
      .from('marketers')
      .insert({
        user_id: user.id,
        referral_code: code,
        display_name: String(p.display_name),
        email: String(p.email),
        phone: p.phone ? String(p.phone) : null,
        country: String(p.country ?? 'ZW'),
        status: 'pending',
        notes: JSON.stringify({
          full_name: String(p.full_name),
          city: String(p.city),
          bio: String(p.bio),
          audience_size: String(p.audience_size),
          channels,
        }),
      })
      .select('id, referral_code')
      .single();

    if (mErr) {
      console.error('[marketer onboard] insert error:', mErr);
      return NextResponse.json({ error: mErr.message }, { status: 500 });
    }

    // Activity feed
    try {
      await admin.from('activity_feed').insert({
        type: 'marketer_apply',
        title: '📢 New Marketer Application',
        description: `${String(p.display_name)} applied as marketer with code ${code}`,
        country: String(p.country ?? 'ZW'),
        country_flag: '📢',
        metadata: {
          marketer_id: marketer.id,
          referral_code: code,
          channels,
          audience_size: String(p.audience_size),
        },
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({
      ok: true,
      marketer_id: marketer.id,
      referral_code: marketer.referral_code,
    });
  } catch (err) {
    console.error('[onboarding/marketer] unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
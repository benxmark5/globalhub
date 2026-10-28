// app/api/apply/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

export async function GET(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Parallel fetch all 3 application types for this user
    const [providerRes, vendorRes, marketerRes] = await Promise.all([
      admin
        .from('provider_applications')
        .select('id, display_name, service_category, status, created_at, reviewed_at, rejection_reason, provider_level, trust_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin
        .from('vendors')
        .select('id, display_name, legal_name, entity_type, city, status, created_at, approved_at, rejected_at, rejection_reason')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin
        .from('marketers')
        .select('id, display_name, referral_code, status, created_at, approved_at, rejected_at, rejection_reason, total_conversions, pending_earnings')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    const providerApps = providerRes.data ?? [];
    const vendorApps = vendorRes.data ?? [];
    const marketerApps = marketerRes.data ?? [];

    // For provider apps, fetch KYC counts
    const providerIds = providerApps.map(a => a.id);
    let providerKycCounts: Record<string, { total: number; verified: number; pending: number; rejected: number }> = {};
    if (providerIds.length > 0) {
      const { data: kycRows } = await admin
        .from('provider_kyc_documents')
        .select('provider_application_id, status')
        .in('provider_application_id', providerIds);

      for (const row of kycRows ?? []) {
        const id = row.provider_application_id;
        if (!providerKycCounts[id]) {
          providerKycCounts[id] = { total: 0, verified: 0, pending: 0, rejected: 0 };
        }
        providerKycCounts[id].total++;
        const s = String(row.status);
        if (s === 'verified') providerKycCounts[id].verified++;
        else if (s === 'pending') providerKycCounts[id].pending++;
        else if (s === 'rejected') providerKycCounts[id].rejected++;
      }
    }

    // For vendor apps, fetch KYC counts
    const vendorIds = vendorApps.map(v => v.id);
    let vendorKycCounts: Record<string, { total: number; verified: number; pending: number; rejected: number }> = {};
    if (vendorIds.length > 0) {
      const { data: kycRows } = await admin
        .from('vendor_kyc_documents')
        .select('vendor_id, status')
        .in('vendor_id', vendorIds);

      for (const row of kycRows ?? []) {
        const id = row.vendor_id;
        if (!vendorKycCounts[id]) {
          vendorKycCounts[id] = { total: 0, verified: 0, pending: 0, rejected: 0 };
        }
        vendorKycCounts[id].total++;
        const s = String(row.status);
        if (s === 'verified') vendorKycCounts[id].verified++;
        else if (s === 'pending') vendorKycCounts[id].pending++;
        else if (s === 'rejected') vendorKycCounts[id].rejected++;
      }
    }

    return NextResponse.json({
      ok: true,
      user: { email: user.email },
      provider: providerApps.map(a => ({
        ...a,
        kyc: providerKycCounts[a.id] ?? { total: 0, verified: 0, pending: 0, rejected: 0 },
      })),
      vendor: vendorApps.map(v => ({
        ...v,
        kyc: vendorKycCounts[v.id] ?? { total: 0, verified: 0, pending: 0, rejected: 0 },
      })),
      marketer: marketerApps,
    });
  } catch (err) {
    console.error('[apply/status] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
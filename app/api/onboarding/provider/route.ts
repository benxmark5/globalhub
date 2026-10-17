// app/api/onboarding/provider/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

const BUCKET = 'provider-kyc';
const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_DOC_TYPES = new Set([
  'national_id_front',
  'national_id_back',
  'passport',
  'proof_of_address',
  'business_registration',
  'tax_id',
]);

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png']);
const PDF_MIMES = new Set(['application/pdf']);
const ALL_DOC_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

// Which MIME types are valid for which doc type
const DOC_MIME_RULES: Record<string, Set<string>> = {
  national_id_front: IMAGE_MIMES,
  national_id_back: IMAGE_MIMES,
  passport: ALL_DOC_MIMES,
  proof_of_address: ALL_DOC_MIMES,
  business_registration: ALL_DOC_MIMES,
  tax_id: ALL_DOC_MIMES,
};

const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
    }

    // ─── Auth: require signed-in user (applicant) ─────────────
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
      return NextResponse.json({ error: 'You must be signed in to submit an application' }, { status: 401 });
    }

    // ─── Parse multipart form ────────────────────────────────
    const form = await req.formData();
    const payloadRaw = form.get('payload');
    if (typeof payloadRaw !== 'string') {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid payload JSON' }, { status: 400 });
    }

    // ─── Validate required application fields ────────────────
    const required = ['full_name', 'display_name', 'email', 'country', 'bio', 'service_category', 'service_title', 'service_description', 'payout_method', 'payout_name', 'payout_identifier'];
    for (const key of required) {
      const v = payload[key];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    // Enforce required agreements
    const requiredBooleans = [
      'agree_professional', 'agree_no_misrepresent', 'agree_no_fake_reviews',
      'agree_no_impersonate', 'agree_support', 'agree_complaints',
      'agree_terms', 'agree_escrow', 'agree_fees',
    ];
    for (const key of requiredBooleans) {
      if (payload[key] !== true) {
        return NextResponse.json({ error: `Agreement not accepted: ${key}` }, { status: 400 });
      }
    }

    // ─── Collect files from form ─────────────────────────────
    const filesByDocType: Record<string, File> = {};
    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        // Files are submitted as e.g. "file_national_id_front"
        const docType = key.startsWith('file_') ? key.slice(5) : key;
        if (!ALLOWED_DOC_TYPES.has(docType)) continue;
        filesByDocType[docType] = value;
      }
    }

    // Required docs for provider applications
    const REQUIRED_DOCS = ['national_id_front', 'national_id_back', 'proof_of_address'];
    for (const docType of REQUIRED_DOCS) {
      if (!filesByDocType[docType]) {
        return NextResponse.json({ error: `Missing required document: ${docType}` }, { status: 400 });
      }
    }

    // ─── Validate each file ──────────────────────────────────
    for (const [docType, file] of Object.entries(filesByDocType)) {
      const allowed = DOC_MIME_RULES[docType];
      if (!allowed) continue;
      if (!allowed.has(file.type)) {
        return NextResponse.json({
          error: `${docType}: invalid file type "${file.type}" — allowed: ${[...allowed].join(', ')}`,
        }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `${docType}: file too large (max 10 MB)` }, { status: 400 });
      }
      if (file.size === 0) {
        return NextResponse.json({ error: `${docType}: file is empty` }, { status: 400 });
      }
    }

    // ─── Insert provider_applications row ────────────────────
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: application, error: appErr } = await admin
      .from('provider_applications')
      .insert({
        user_id: user.id,
        full_name: String(payload.full_name),
        display_name: String(payload.display_name),
        email: String(payload.email),
        phone: payload.phone ? String(payload.phone) : null,
        country: String(payload.country),
        timezone: payload.timezone ? String(payload.timezone) : null,
        bio: String(payload.bio),
        website: payload.website ? String(payload.website) : null,
        telegram: payload.telegram ? String(payload.telegram) : null,
        whatsapp: payload.whatsapp ? String(payload.whatsapp) : null,
        facebook: payload.facebook ? String(payload.facebook) : null,
        linkedin: payload.linkedin ? String(payload.linkedin) : null,
        twitter: payload.twitter ? String(payload.twitter) : null,
        service_category: String(payload.service_category),
        service_title: String(payload.service_title),
        service_description: String(payload.service_description),
        delivery_process: payload.delivery_process ? String(payload.delivery_process) : null,
        delivery_time: payload.delivery_time ? String(payload.delivery_time) : null,
        pricing_structure: payload.pricing_structure ? String(payload.pricing_structure) : null,
        refund_policy: payload.refund_policy ? String(payload.refund_policy) : null,
        expected_outcome: payload.expected_outcome ? String(payload.expected_outcome) : null,
        support_method: payload.support_method ? String(payload.support_method) : null,
        agree_professional: !!payload.agree_professional,
        agree_no_misrepresent: !!payload.agree_no_misrepresent,
        agree_no_fake_reviews: !!payload.agree_no_fake_reviews,
        agree_no_impersonate: !!payload.agree_no_impersonate,
        agree_support: !!payload.agree_support,
        agree_complaints: !!payload.agree_complaints,
        payout_method: String(payload.payout_method),
        payout_name: String(payload.payout_name),
        payout_identifier: String(payload.payout_identifier),
        payout_currency: payload.payout_currency ? String(payload.payout_currency) : 'USD',
        agree_terms: !!payload.agree_terms,
        agree_escrow: !!payload.agree_escrow,
        agree_fees: !!payload.agree_fees,
        status: 'pending',
      })
      .select('id')
      .single();

    if (appErr) {
      console.error('[onboarding/provider] insert error:', appErr);
      return NextResponse.json({ error: appErr.message }, { status: 500 });
    }

    // ─── Upload files + insert provider_kyc_documents rows ───
    const uploadResults: Array<{ doc_type: string; storage_path: string }> = [];

    for (const [docType, file] of Object.entries(filesByDocType)) {
      const ext = EXT_BY_MIME[file.type] ?? 'bin';
      const stamp = Date.now();
      const storagePath = `${user.id}/${application.id}/${docType}-${stamp}.${ext}`;

      const arrayBuf = await file.arrayBuffer();
      const { error: uploadErr } = await admin.storage
        .from(BUCKET)
        .upload(storagePath, arrayBuf, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error(`[onboarding/provider] upload ${docType} failed:`, uploadErr);
        // Rollback: delete the application we just created
        await admin.from('provider_applications').delete().eq('id', application.id);
        // Clean up any files already uploaded
        for (const u of uploadResults) {
          await admin.storage.from(BUCKET).remove([u.storage_path]);
        }
        return NextResponse.json({ error: `Upload failed for ${docType}: ${uploadErr.message}` }, { status: 500 });
      }

      const { error: docErr } = await admin
        .from('provider_kyc_documents')
        .insert({
          provider_application_id: application.id,
          user_id: user.id,
          doc_type: docType,
          status: 'pending',
          storage_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        });

      if (docErr) {
        console.error(`[onboarding/provider] doc row ${docType} failed:`, docErr);
        await admin.storage.from(BUCKET).remove([storagePath]);
        await admin.from('provider_applications').delete().eq('id', application.id);
        for (const u of uploadResults) {
          await admin.storage.from(BUCKET).remove([u.storage_path]);
        }
        return NextResponse.json({ error: docErr.message }, { status: 500 });
      }

      uploadResults.push({ doc_type: docType, storage_path: storagePath });
    }

    // ─── Activity feed (best effort) ─────────────────────────
    try {
      await admin.from('activity_feed').insert({
        type: 'provider_apply',
        title: '📋 New Provider Application',
        description: `${String(payload.display_name)} applied as ${String(payload.service_category)} provider`,
        country: String(payload.country),
        country_flag: '📋',
        metadata: {
          service: String(payload.service_category),
          country: String(payload.country),
          application_id: application.id,
          kyc_docs: Object.keys(filesByDocType),
        },
      });
    } catch (feedErr) {
      console.warn('[onboarding/provider] activity feed insert failed (non-fatal):', feedErr);
    }

    return NextResponse.json({
      ok: true,
      application_id: application.id,
      documents_uploaded: uploadResults.length,
    });
  } catch (err) {
    console.error('[onboarding/provider] unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
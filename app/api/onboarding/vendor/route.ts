// app/api/onboarding/vendor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

const KYC_BUCKET = 'vendor-kyc';
const MAX_SIZE = 10 * 1024 * 1024;

// Doc types accepted for vendors
const ALLOWED_DOC_TYPES = new Set([
  'national_id_front',
  'national_id_back',
  'passport',
  'business_registration',
  'tax_id',
  'proof_of_address',
]);

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png']);
const ALL_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

// Doc-specific MIME rules
const DOC_MIME_RULES: Record<string, Set<string>> = {
  national_id_front: IMAGE_MIMES,
  national_id_back: IMAGE_MIMES,
  passport: ALL_MIMES,
  proof_of_address: ALL_MIMES,
  business_registration: ALL_MIMES,
  tax_id: ALL_MIMES,
};

// Server-side filename blocklist (second defense after client-side)
const BLOCKED_FILENAME_PATTERNS = [
  'assignment', 'homework', 'essay', 'thesis', 'lecture',
  'syllabus', 'curriculum', 'slides', 'presentation',
  'resume', 'cv', 'coursework', 'project', 'proposal',
];

function isBlockedFilename(name: string): { blocked: boolean; reason?: string } {
  const lower = name.toLowerCase();
  for (const pat of BLOCKED_FILENAME_PATTERNS) {
    if (lower.includes(pat)) {
      return {
        blocked: true,
        reason: `Filename "${name}" doesn't look like a personal document. Please upload your actual ID / utility bill.`,
      };
    }
  }
  return { blocked: false };
}

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

    // ─── Auth ───
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

    // ─── Parse multipart ───
    const form = await req.formData();
    const payloadRaw = form.get('payload');
    if (typeof payloadRaw !== 'string') {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }
    let p: Record<string, unknown>;
    try {
      p = JSON.parse(payloadRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid payload JSON' }, { status: 400 });
    }

    // ─── Validate required fields ───
    const required = [
      'legal_name', 'display_name', 'entity_type', 'country', 'city', 'address',
      'email', 'phone', 'settlement_method', 'collection_currency',
      'bank_name', 'bank_account_holder', 'bank_account_number',
    ];
    for (const k of required) {
      const v = p[k];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 });
      }
    }

    const entityType = String(p.entity_type);
    if (!['individual', 'registered_business'].includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 });
    }

    if (entityType === 'registered_business') {
      if (!p.business_registration_no || String(p.business_registration_no).trim() === '') {
        return NextResponse.json({ error: 'Business registration number required' }, { status: 400 });
      }
      if (!p.tax_id || String(p.tax_id).trim() === '') {
        return NextResponse.json({ error: 'Tax ID required' }, { status: 400 });
      }
    }

    // ─── Name confirmation gate ───
    if (p.name_confirmed_by_user !== true) {
      return NextResponse.json({
        error: 'You must confirm that the name on your ID matches your entered legal name.',
      }, { status: 400 });
    }

    // ─── Agreements ───
    for (const k of ['agree_terms', 'agree_remittance', 'agree_accuracy']) {
      if (p[k] !== true) {
        return NextResponse.json({ error: `Agreement not accepted: ${k}` }, { status: 400 });
      }
    }

    // ─── Collect files ───
    const filesByDocType: Record<string, File> = {};
    for (const [key, value] of form.entries()) {
      if (value instanceof File) {
        const docType = key.startsWith('file_') ? key.slice(5) : key;
        if (!ALLOWED_DOC_TYPES.has(docType)) continue;
        filesByDocType[docType] = value;
      }
    }

    // ─── Required docs ───
    const REQUIRED_DOCS = ['national_id_front', 'national_id_back', 'proof_of_address'];
    if (entityType === 'registered_business') {
      REQUIRED_DOCS.push('business_registration', 'tax_id');
    }
    for (const docType of REQUIRED_DOCS) {
      if (!filesByDocType[docType]) {
        return NextResponse.json({ error: `Missing required document: ${docType}` }, { status: 400 });
      }
    }

    // ─── Validate each file (MIME + size + filename heuristic) ───
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

      const fnCheck = isBlockedFilename(file.name);
      if (fnCheck.blocked) {
        return NextResponse.json({ error: `${docType}: ${fnCheck.reason}` }, { status: 400 });
      }
    }

    // ─── Check no prior application ───
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: existing } = await admin
      .from('vendors')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        error: `You already have a vendor application (status: ${existing.status}). Contact support to update.`,
      }, { status: 400 });
    }

    // ─── Insert vendor row ───
    const { data: vendor, error: vErr } = await admin
      .from('vendors')
      .insert({
        user_id: user.id,
        legal_name: String(p.legal_name),
        display_name: String(p.display_name),
        entity_type: entityType,
        business_registration_no: entityType === 'registered_business' ? String(p.business_registration_no) : null,
        tax_id: entityType === 'registered_business' ? String(p.tax_id) : null,
        email: String(p.email),
        phone: String(p.phone),
        whatsapp: p.whatsapp ? String(p.whatsapp) : null,
        country: String(p.country),
        city: String(p.city),
        address: String(p.address),
        settlement_method: String(p.settlement_method),
        collection_currency: String(p.collection_currency),
        status: 'application_started',
        commission_config: {
          percent: 2.5,
          fixed_usd: 0.20,
          version: 1,
          reason: 'Default rate on public application',
        },
      })
      .select('id')
      .single();

    if (vErr) {
      console.error('[vendor onboard] insert error:', vErr);
      return NextResponse.json({ error: vErr.message }, { status: 500 });
    }

    // ─── Insert bank account ───
    const { error: bankErr } = await admin
      .from('vendor_bank_accounts')
      .insert({
        vendor_id: vendor.id,
        bank_name: String(p.bank_name),
        account_holder: String(p.bank_account_holder),
        account_number: String(p.bank_account_number),
        branch_code: p.bank_branch_code ? String(p.bank_branch_code) : null,
        swift_bic: p.bank_swift_bic ? String(p.bank_swift_bic) : null,
        country: String(p.country),
        currency: String(p.collection_currency),
        is_primary: true,
        verification_status: 'unverified',
      });

    if (bankErr) {
      console.error('[vendor onboard] bank insert error:', bankErr);
      await admin.from('vendors').delete().eq('id', vendor.id);
      return NextResponse.json({ error: bankErr.message }, { status: 500 });
    }

    // ─── Upload KYC files with name-confirmation metadata ───
    const uploaded: Array<{ doc_type: string; storage_path: string }> = [];
    const confirmedAt = new Date().toISOString();

    for (const [docType, file] of Object.entries(filesByDocType)) {
      const ext = EXT_BY_MIME[file.type] ?? 'bin';
      const stamp = Date.now();
      const storagePath = `${user.id}/${vendor.id}/${docType}-${stamp}.${ext}`;

      const arrayBuf = await file.arrayBuffer();
      const { error: uploadErr } = await admin.storage
        .from(KYC_BUCKET)
        .upload(storagePath, arrayBuf, { contentType: file.type, upsert: false });

      if (uploadErr) {
        console.error(`[vendor onboard] upload ${docType} failed:`, uploadErr);
        for (const u of uploaded) {
          await admin.storage.from(KYC_BUCKET).remove([u.storage_path]);
        }
        await admin.from('vendors').delete().eq('id', vendor.id);
        return NextResponse.json({ error: `Upload failed for ${docType}: ${uploadErr.message}` }, { status: 500 });
      }

      const { error: docErr } = await admin
        .from('vendor_kyc_documents')
        .insert({
          vendor_id: vendor.id,
          doc_type: docType,
          status: 'pending',
          storage_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          name_confirmed_by_user: true,
          name_confirmed_at: confirmedAt,
        });

      if (docErr) {
        console.error(`[vendor onboard] doc row ${docType} failed:`, docErr);
        await admin.storage.from(KYC_BUCKET).remove([storagePath]);
        for (const u of uploaded) {
          await admin.storage.from(KYC_BUCKET).remove([u.storage_path]);
        }
        await admin.from('vendors').delete().eq('id', vendor.id);
        return NextResponse.json({ error: docErr.message }, { status: 500 });
      }

      uploaded.push({ doc_type: docType, storage_path: storagePath });
    }

    // ─── Activity feed ───
    try {
      await admin.from('activity_feed').insert({
        type: 'vendor_apply',
        title: '💼 New Vendor Application',
        description: `${String(p.display_name)} applied as ${entityType === 'registered_business' ? 'business' : 'individual'} vendor in ${String(p.city)}`,
        country: String(p.country),
        country_flag: '💼',
        metadata: {
          vendor_id: vendor.id,
          entity_type: entityType,
          city: String(p.city),
          kyc_docs: Object.keys(filesByDocType),
          name_confirmed: true,
        },
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({
      ok: true,
      vendor_id: vendor.id,
      documents_uploaded: uploaded.length,
    });
  } catch (err) {
    console.error('[onboarding/vendor] unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
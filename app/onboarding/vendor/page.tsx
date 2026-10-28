// app/onboarding/vendor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, ArrowRight, CheckCircle, User, Globe,
  Briefcase, Shield, CreditCard, FileText, AlertTriangle,
  Building2, Phone, Mail, ShieldCheck, Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { id: 1, label: 'Identity',    icon: User },
  { id: 2, label: 'Contact',     icon: Phone },
  { id: 3, label: 'Business',    icon: Building2 },
  { id: 4, label: 'Settlement',  icon: CreditCard },
  { id: 5, label: 'Verify',      icon: ShieldCheck },
  { id: 6, label: 'Agreement',   icon: FileText },
];

const ZW_CITIES = [
  'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru',
  'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Marondera',
  'Norton', 'Bindura', 'Beitbridge', 'Victoria Falls', 'Hwange', 'Other',
];

// Filenames that clearly aren't personal/identity documents
const BLOCKED_FILENAME_PATTERNS = [
  'assignment', 'homework', 'essay', 'thesis', 'lecture',
  'syllabus', 'curriculum', 'slides', 'presentation',
  'resume', 'cv', 'coursework', 'project', 'proposal',
];

// Filenames that are suspicious but might be legit (utility bills sometimes have these)
const WARN_FILENAME_PATTERNS = ['invoice', 'receipt'];

function filenameCheck(fileName: string): { blocked: boolean; reason?: string; warn?: string } {
  const lower = fileName.toLowerCase();
  for (const pat of BLOCKED_FILENAME_PATTERNS) {
    if (lower.includes(pat)) {
      return {
        blocked: true,
        reason: `This filename doesn't look like a personal document. Please upload your actual ID / utility bill, not "${fileName}".`,
      };
    }
  }
  for (const pat of WARN_FILENAME_PATTERNS) {
    if (lower.includes(pat)) {
      return {
        blocked: false,
        warn: `"${fileName}" may not be your actual utility bill. Make sure it clearly shows your name and address.`,
      };
    }
  }
  return { blocked: false };
}

type EntityType = 'individual' | 'registered_business';
type SettlementMethod = 'full_remittance' | 'net_settlement';

type FormData = {
  legal_name: string;
  display_name: string;
  entity_type: EntityType;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  business_registration_no: string;
  tax_id: string;
  settlement_method: SettlementMethod;
  collection_currency: string;
  bank_name: string;
  bank_account_holder: string;
  bank_account_number: string;
  bank_branch_code: string;
  bank_swift_bic: string;
  agree_terms: boolean;
  agree_remittance: boolean;
  agree_accuracy: boolean;
};

const INITIAL: FormData = {
  legal_name: '', display_name: '', entity_type: 'individual',
  country: 'ZW', city: '', address: '',
  email: '', phone: '', whatsapp: '',
  business_registration_no: '', tax_id: '',
  settlement_method: 'full_remittance', collection_currency: 'USD',
  bank_name: '', bank_account_holder: '', bank_account_number: '',
  bank_branch_code: '', bank_swift_bic: '',
  agree_terms: false, agree_remittance: false, agree_accuracy: false,
};

type KycFiles = {
  national_id_front: File | null;
  national_id_back: File | null;
  proof_of_address: File | null;
  business_registration: File | null;
  tax_id: File | null;
};

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [files, setFiles] = useState<KycFiles>({
    national_id_front: null,
    national_id_back: null,
    proof_of_address: null,
    business_registration: null,
    tax_id: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setForm(prev => ({
          ...prev,
          email: session.user.email || '',
          legal_name: session.user.user_metadata?.full_name || '',
        }));
      }
    });
  }, []);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key as string]; return n; });
  };

  const isBusiness = form.entity_type === 'registered_business';

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!form.legal_name.trim()) errs.legal_name = 'Legal name is required';
      if (!form.display_name.trim()) errs.display_name = 'Display name is required';
      if (!form.city) errs.city = 'City is required';
      if (!form.address.trim() || form.address.length < 10) errs.address = 'Full address is required (min 10 chars)';
    }
    if (step === 2) {
      if (!form.email.trim()) errs.email = 'Email is required';
      if (!form.phone.trim()) errs.phone = 'Phone is required';
    }
    if (step === 3 && isBusiness) {
      if (!form.business_registration_no.trim()) errs.business_registration_no = 'Business registration number required';
      if (!form.tax_id.trim()) errs.tax_id = 'Tax ID required';
    }
    if (step === 4) {
      if (!form.bank_name.trim()) errs.bank_name = 'Bank name required';
      if (!form.bank_account_holder.trim()) errs.bank_account_holder = 'Account holder required';
      if (!form.bank_account_number.trim()) errs.bank_account_number = 'Account number required';
    }
    if (step === 5) {
      if (!files.national_id_front) errs.national_id_front = 'Front of National ID is required';
      if (!files.national_id_back) errs.national_id_back = 'Back of National ID is required';
      if (!files.proof_of_address) errs.proof_of_address = 'Proof of address is required';
      if (isBusiness) {
        if (!files.business_registration) errs.business_registration = 'Business registration certificate required';
        if (!files.tax_id) errs.tax_id = 'Tax ID document required';
      }
      if (!nameConfirmed) errs.name_confirmed = 'You must confirm the name matches your ID';
    }
    if (step === 6) {
      if (!form.agree_terms || !form.agree_remittance || !form.agree_accuracy) {
        errs.agreement = 'You must accept all agreements';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 6) setStep(s => s + 1);
    else handleSubmit();
  };

  const prevStep = () => { if (step > 1) setStep(s => s - 1); };

  const handleFileSelect = (
    key: keyof KycFiles,
    file: File | null,
    acceptMime: string,
  ) => {
    if (!file) {
      setFiles(prev => ({ ...prev, [key]: null }));
      return;
    }
    // MIME check
    if (!acceptMime.split(',').some(m => file.type === m.trim() || m.trim() === 'image/*' && file.type.startsWith('image/') || m.trim() === 'application/pdf' && file.type === 'application/pdf' || m.trim() === '.pdf' && file.type === 'application/pdf' || m.trim() === '.jpg' && file.type === 'image/jpeg' || m.trim() === '.jpeg' && file.type === 'image/jpeg' || m.trim() === '.png' && file.type === 'image/png')) {
      setErrors(prev => ({ ...prev, [key]: `Invalid file type. Accepted: ${acceptMime}` }));
      return;
    }
    // Filename heuristic
    const check = filenameCheck(file.name);
    if (check.blocked) {
      setErrors(prev => ({ ...prev, [key]: check.reason || 'Invalid file' }));
      return;
    }
    // Size
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [key]: 'File too large (max 10 MB)' }));
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file }));
    setErrors(prev => {
      const n = { ...prev };
      delete n[key];
      if (check.warn) n[`${key}_warn`] = check.warn;
      return n;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append('payload', JSON.stringify({
        legal_name: form.legal_name,
        display_name: form.display_name,
        entity_type: form.entity_type,
        country: form.country,
        city: form.city,
        address: form.address,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        business_registration_no: isBusiness ? form.business_registration_no : null,
        tax_id: isBusiness ? form.tax_id : null,
        settlement_method: form.settlement_method,
        collection_currency: form.collection_currency,
        bank_name: form.bank_name,
        bank_account_holder: form.bank_account_holder,
        bank_account_number: form.bank_account_number,
        bank_branch_code: form.bank_branch_code || null,
        bank_swift_bic: form.bank_swift_bic || null,
        name_confirmed_by_user: nameConfirmed,
        agree_terms: form.agree_terms,
        agree_remittance: form.agree_remittance,
        agree_accuracy: form.agree_accuracy,
      }));

      if (files.national_id_front) fd.append('file_national_id_front', files.national_id_front);
      if (files.national_id_back)  fd.append('file_national_id_back', files.national_id_back);
      if (files.proof_of_address)  fd.append('file_proof_of_address', files.proof_of_address);
      if (isBusiness && files.business_registration) fd.append('file_business_registration', files.business_registration);
      if (isBusiness && files.tax_id)               fd.append('file_tax_id', files.tax_id);

      const res = await fetch('/api/onboarding/vendor', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (e: any) {
      setErrors({ submit: e?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#060f1e',
    border: '1.5px solid #1a2740', borderRadius: '10px',
    padding: '13px 14px', color: 'white', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#9ca3af',
    fontSize: '12px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '7px',
  };
  const errStyle: React.CSSProperties = { color: '#f87171', fontSize: '12px', marginTop: '5px' };
  const warnStyle: React.CSSProperties = { color: '#fbbf24', fontSize: '12px', marginTop: '5px' };

  if (submitted) {
    return (
      <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', background: 'rgba(96,165,250,0.1)', border: '2px solid rgba(96,165,250,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={46} color="#60a5fa" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '32px', color: 'white', marginBottom: '14px', letterSpacing: '-1px' }}>
            Vendor Application Submitted
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
            Thank you, <strong style={{ color: 'white' }}>{form.display_name}</strong>!
            Your application is under review.
          </p>
          <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            {[
              { icon: '🔍', text: 'Identity verification: 24–48 hours' },
              { icon: '💳', text: 'Bank account verified separately' },
              { icon: '📄', text: 'Contract sent after approval' },
              { icon: '✅', text: 'You will be notified once approved' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#60a5fa', color: 'black', padding: '14px 28px', borderRadius: '12px', fontWeight: 900, fontSize: '15px', textDecoration: 'none' }}>
            <Trophy size={18} /> Return to GlobalHub
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / 5) * 100;

  return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={prevStep} disabled={step === 1} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: step === 1 ? 'not-allowed' : 'pointer', color: step === 1 ? '#374151' : '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
            <div style={{ width: '26px', height: '26px', background: '#60a5fa', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={12} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '14px', color: 'white' }}>
              GLOBAL<span style={{ color: '#60a5fa' }}>HUB</span>
            </span>
          </Link>
          <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700 }}>Vendor · Step {step} of 6</span>
        </div>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ background: '#1a2740', borderRadius: '20px', height: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '20px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {STEPS.map(s => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#60a5fa' : active ? 'rgba(96,165,250,0.2)' : '#1a2740', border: `2px solid ${done ? '#60a5fa' : active ? '#60a5fa' : '#1a2740'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? <CheckCircle size={14} color="black" /> : <Icon size={12} color={active ? '#60a5fa' : '#374151'} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* Step 1 — Identity */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Identity</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Tell us who you are</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Legal Name *</label>
                <input type="text" value={form.legal_name} onChange={e => set('legal_name', e.target.value)} placeholder="Full legal name" style={{ ...inputStyle, borderColor: errors.legal_name ? '#f87171' : '#1a2740' }} />
                {errors.legal_name && <p style={errStyle}>{errors.legal_name}</p>}
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                  Must exactly match the name on your National ID
                </p>
              </div>
              <div>
                <label style={labelStyle}>Display Name *</label>
                <input type="text" value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Business / brand name" style={{ ...inputStyle, borderColor: errors.display_name ? '#f87171' : '#1a2740' }} />
                {errors.display_name && <p style={errStyle}>{errors.display_name}</p>}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Entity Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { value: 'individual' as const, label: 'Individual', desc: 'Personal collection agent' },
                  { value: 'registered_business' as const, label: 'Registered business', desc: 'Company / registered entity' },
                ].map(opt => {
                  const selected = form.entity_type === opt.value;
                  return (
                    <div key={opt.value} onClick={() => set('entity_type', opt.value)} style={{ padding: '16px', borderRadius: '12px', background: selected ? 'rgba(96,165,250,0.1)' : '#0a1628', border: `1.5px solid ${selected ? '#60a5fa' : '#1a2740'}`, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selected ? '#60a5fa' : '#374151'}`, background: selected ? '#60a5fa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#060f1e' }} />}
                        </div>
                        <p style={{ color: selected ? 'white' : '#9ca3af', fontSize: '14px', fontWeight: 700, margin: 0 }}>{opt.label}</p>
                      </div>
                      <p style={{ color: selected ? '#93c5fd' : '#6b7280', fontSize: '12px', margin: 0 }}>{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Country *</label>
                <input type="text" value={form.country} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <select value={form.city} onChange={e => set('city', e.target.value)} style={{ ...inputStyle, borderColor: errors.city ? '#f87171' : '#1a2740' }}>
                  <option value="">Select city...</option>
                  {ZW_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p style={errStyle}>{errors.city}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full Address *</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={3} placeholder="Street, suburb, city, postal code" style={{ ...inputStyle, resize: 'vertical', borderColor: errors.address ? '#f87171' : '#1a2740' }} />
              {errors.address && <p style={errStyle}>{errors.address}</p>}
            </div>
          </div>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Contact</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>How we reach you</p>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={{ ...inputStyle, borderColor: errors.email ? '#f87171' : '#1a2740' }} />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+263..." style={{ ...inputStyle, borderColor: errors.phone ? '#f87171' : '#1a2740' }} />
                {errors.phone && <p style={errStyle}>{errors.phone}</p>}
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+263... (optional)" style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Business */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Business details</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Required for registered businesses</p>
              </div>
            </div>

            {isBusiness ? (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Business Registration No. *</label>
                  <input type="text" value={form.business_registration_no} onChange={e => set('business_registration_no', e.target.value)} placeholder="Company registration number" style={{ ...inputStyle, borderColor: errors.business_registration_no ? '#f87171' : '#1a2740' }} />
                  {errors.business_registration_no && <p style={errStyle}>{errors.business_registration_no}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Tax ID *</label>
                  <input type="text" value={form.tax_id} onChange={e => set('tax_id', e.target.value)} placeholder="ZIMRA Tax ID" style={{ ...inputStyle, borderColor: errors.tax_id ? '#f87171' : '#1a2740' }} />
                  {errors.tax_id && <p style={errStyle}>{errors.tax_id}</p>}
                </div>
              </>
            ) : (
              <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <Building2 size={32} color="#60a5fa" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Individual vendor</p>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                  Business details aren't required for individual vendors. Click Next.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Settlement */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Settlement & bank</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>How you'll remit and receive earnings</p>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Settlement method *</label>
              <select value={form.settlement_method} onChange={e => set('settlement_method', e.target.value as SettlementMethod)} style={inputStyle}>
                <option value="full_remittance">Full remittance — send all collections, get paid separately</option>
                <option value="net_settlement">Net settlement — keep commission upfront</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Collection currency *</label>
              <select value={form.collection_currency} onChange={e => set('collection_currency', e.target.value)} style={inputStyle}>
                <option value="USD">USD — US Dollar</option>
                <option value="ZWL">ZWL — Zimbabwe Dollar</option>
              </select>
            </div>

            <div style={{ padding: '20px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px' }}>
              <p style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Primary bank account
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Bank name *</label>
                <input type="text" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="e.g. CBZ Bank" style={{ ...inputStyle, borderColor: errors.bank_name ? '#f87171' : '#1a2740' }} />
                {errors.bank_name && <p style={errStyle}>{errors.bank_name}</p>}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Account holder *</label>
                <input type="text" value={form.bank_account_holder} onChange={e => set('bank_account_holder', e.target.value)} placeholder="Full legal name on account" style={{ ...inputStyle, borderColor: errors.bank_account_holder ? '#f87171' : '#1a2740' }} />
                {errors.bank_account_holder && <p style={errStyle}>{errors.bank_account_holder}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Account number *</label>
                  <input type="text" value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value)} placeholder="0123456789" style={{ ...inputStyle, fontFamily: 'monospace', borderColor: errors.bank_account_number ? '#f87171' : '#1a2740' }} />
                  {errors.bank_account_number && <p style={errStyle}>{errors.bank_account_number}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Branch code</label>
                  <input type="text" value={form.bank_branch_code} onChange={e => set('bank_branch_code', e.target.value)} placeholder="Optional" style={{ ...inputStyle, fontFamily: 'monospace' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>SWIFT / BIC</label>
                <input type="text" value={form.bank_swift_bic} onChange={e => set('bank_swift_bic', e.target.value)} placeholder="e.g. COBZZWHA" style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Identity verification */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Identity verification</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>We verify your identity to protect everyone on the platform</p>
              </div>
            </div>

            <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Lock size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#bfdbfe', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Documents are stored privately and only visible to GlobalHub reviewers.
                Accepted formats: <strong>JPG, PNG, PDF</strong> · max 10 MB each.
              </p>
            </div>

            {[
              {
                key: 'national_id_front' as const,
                label: 'National ID — front *',
                hint: 'Clear photo of the front of your ID',
                accept: 'image/jpeg,image/png',
              },
              {
                key: 'national_id_back' as const,
                label: 'National ID — back *',
                hint: 'Clear photo of the back of your ID',
                accept: 'image/jpeg,image/png',
              },
              {
                key: 'proof_of_address' as const,
                label: 'Proof of address *',
                hint: 'Utility bill or bank statement (last 3 months)',
                accept: 'image/jpeg,image/png,application/pdf',
              },
              ...(isBusiness ? [
                {
                  key: 'business_registration' as const,
                  label: 'Business registration certificate *',
                  hint: 'Company registration document',
                  accept: 'image/jpeg,image/png,application/pdf',
                },
                {
                  key: 'tax_id' as const,
                  label: 'Tax ID document *',
                  hint: 'ZIMRA tax certificate',
                  accept: 'image/jpeg,image/png,application/pdf',
                },
              ] : []),
            ].map(field => {
              const selected = files[field.key];
              const errMsg = errors[field.key];
              const warnMsg = errors[`${field.key}_warn`];
              return (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>{field.label}</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '18px',
                    background: selected ? 'rgba(34,197,94,0.08)' : '#0a1628',
                    border: `1.5px dashed ${errMsg ? '#f87171' : selected ? '#22c55e' : '#1a2740'}`,
                    borderRadius: '12px', cursor: 'pointer',
                    color: selected ? '#86efac' : '#9ca3af',
                    fontSize: '13px', transition: 'all 0.2s',
                  }}>
                    <input
                      type="file"
                      accept={field.accept}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        handleFileSelect(field.key, f, field.accept);
                      }}
                    />
                    {selected ? (
                      <>
                        <CheckCircle size={16} color="#22c55e" />
                        <span style={{ fontWeight: 700 }}>{selected.name}</span>
                        <span style={{ color: '#6b7280', fontSize: '11px' }}>
                          ({(selected.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>{field.hint}</span>
                      </>
                    )}
                  </label>
                  {errMsg && <p style={errStyle}>{errMsg}</p>}
                  {warnMsg && <p style={warnStyle}>{warnMsg}</p>}
                </div>
              );
            })}

            {/* Name match confirmation */}
            <div style={{
              marginTop: '24px',
              padding: '18px',
              background: nameConfirmed ? 'rgba(34,197,94,0.05)' : 'rgba(251,191,36,0.05)',
              border: `1.5px solid ${nameConfirmed ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`,
              borderRadius: '12px',
            }}>
              <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Name verification
              </p>
              <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>
                The name on your National ID must exactly match:
                <br />
                <strong style={{ color: 'white', fontSize: '15px' }}>{form.legal_name || '(enter your legal name in Step 1)'}</strong>
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={nameConfirmed}
                  onChange={(e) => {
                    setNameConfirmed(e.target.checked);
                    setErrors(prev => { const n = { ...prev }; delete n.name_confirmed; return n; });
                  }}
                  style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                />
                <span style={{ color: nameConfirmed ? '#86efac' : '#9ca3af', fontSize: '13px', lineHeight: 1.5 }}>
                  I confirm the name shown on my uploaded National ID is <strong>"{form.legal_name}"</strong>.
                  I understand that mismatched names will delay or reject my application.
                </span>
              </label>
              {errors.name_confirmed && <p style={errStyle}>{errors.name_confirmed}</p>}
            </div>
          </div>
        )}

        {/* Step 6 — Agreement */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="#60a5fa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Final agreements</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Confirm your commitments</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'agree_terms' as const,       title: 'Vendor Terms', body: 'I accept the GlobalHub vendor terms of service and code of conduct.' },
                { key: 'agree_remittance' as const,  title: 'Remittance obligations', body: 'I commit to remitting collected customer funds to GlobalHub within the agreed settlement period.' },
                { key: 'agree_accuracy' as const,    title: 'Data accuracy', body: 'All information and documents I have submitted are truthful, accurate, and mine.' },
              ].map(item => {
                const checked = form[item.key];
                return (
                  <div key={item.key} onClick={() => set(item.key, !checked)} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: checked ? 'rgba(34,197,94,0.05)' : '#0a1628', border: `1px solid ${checked ? 'rgba(34,197,94,0.25)' : '#1a2740'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${checked ? '#22c55e' : '#374151'}`, background: checked ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {checked && <CheckCircle size={12} color="black" />}
                    </div>
                    <div>
                      <p style={{ color: checked ? '#86efac' : 'white', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{item.title}</p>
                      <p style={{ color: checked ? '#86efac' : '#9ca3af', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.agreement && <p style={errStyle}>{errors.agreement}</p>}
            {errors.submit && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px' }}>
                <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={prevStep}
            disabled={step === 1 || submitting}
            style={{
              flex: 1, padding: '14px 20px',
              background: step === 1 ? '#0a1628' : '#1a2740',
              border: `1px solid ${step === 1 ? '#0a1628' : '#374151'}`,
              color: step === 1 ? '#374151' : '#9ca3af',
              borderRadius: '12px', fontWeight: 800, fontSize: '14px',
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <ArrowLeft size={16} /> Previous
          </button>
          <button
            onClick={next}
            disabled={submitting}
            style={{
              flex: 2, padding: '14px 20px',
              background: submitting ? '#1a2740' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              border: 'none', color: submitting ? '#6b7280' : 'black',
              borderRadius: '12px', fontWeight: 900, fontSize: '15px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {submitting ? 'Submitting…' : step === 6 ? (<>Submit Application <CheckCircle size={16} /></>) : (<>Next Step <ArrowRight size={16} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
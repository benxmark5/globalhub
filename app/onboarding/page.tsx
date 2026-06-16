"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, ArrowRight, CheckCircle,
  User, Globe, Briefcase, Shield, CreditCard,
  FileText, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const STEPS = [
  { id: 1, label: 'Account',    icon: User },
  { id: 2, label: 'Presence',   icon: Globe },
  { id: 3, label: 'Service',    icon: Briefcase },
  { id: 4, label: 'Standards',  icon: Shield },
  { id: 5, label: 'Payout',     icon: CreditCard },
  { id: 6, label: 'Agreement',  icon: FileText },
];

const SERVICE_CATEGORIES = [
  'Football Betting Tips', 'Aviator Signals', 'Casino Strategy',
  'Sports Analysis', 'Odds Trading', 'Virtual Sports',
  'Digital Products', 'Trading Signals', 'Other',
];

const COUNTRIES = [
  'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Uganda', 'Tanzania',
  'Rwanda', 'Ethiopia', 'Egypt', 'Morocco', 'Botswana', 'Zambia',
  'United States', 'United Kingdom', 'Canada', 'Germany', 'France',
  'India', 'Brazil', 'Australia', 'Netherlands', 'Other',
];

type FormData = {
  // Step 1
  full_name: string; display_name: string; email: string;
  phone: string; country: string; timezone: string; bio: string;
  // Step 2
  website: string; telegram: string; whatsapp: string;
  facebook: string; linkedin: string; twitter: string;
  // Step 3
  service_category: string; service_title: string;
  service_description: string; delivery_process: string;
  delivery_time: string; pricing_structure: string;
  refund_policy: string; expected_outcome: string;
  support_method: string;
  // Step 4
  agree_professional: boolean; agree_no_misrepresent: boolean;
  agree_no_fake_reviews: boolean; agree_no_impersonate: boolean;
  agree_support: boolean; agree_complaints: boolean;
  // Step 5
  payout_method: string; payout_name: string;
  payout_identifier: string; payout_currency: string;
  // Step 6
  agree_terms: boolean; agree_escrow: boolean; agree_fees: boolean;
};

const INITIAL: FormData = {
  full_name: '', display_name: '', email: '', phone: '',
  country: '', timezone: '', bio: '',
  website: '', telegram: '', whatsapp: '',
  facebook: '', linkedin: '', twitter: '',
  service_category: '', service_title: '',
  service_description: '', delivery_process: '',
  delivery_time: '', pricing_structure: '',
  refund_policy: '', expected_outcome: '',
  support_method: '',
  agree_professional: false, agree_no_misrepresent: false,
  agree_no_fake_reviews: false, agree_no_impersonate: false,
  agree_support: false, agree_complaints: false,
  payout_method: '', payout_name: '',
  payout_identifier: '', payout_currency: 'USD',
  agree_terms: false, agree_escrow: false, agree_fees: false,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setForm(prev => ({
          ...prev,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
        }));
      }
    });
  }, []);

  const set = (key: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.full_name.trim()) errs.full_name = 'Full name is required';
      if (!form.display_name.trim()) errs.display_name = 'Brand/display name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      if (!form.country) errs.country = 'Please select your country';
      if (!form.bio.trim() || form.bio.length < 50)
        errs.bio = 'Please write at least 50 characters about yourself';
    }
    if (step === 2) {
      const hasSocial = form.website || form.telegram || form.whatsapp || form.facebook || form.linkedin || form.twitter;
      if (!hasSocial) errs.website = 'Please provide at least one platform presence link';
    }
    if (step === 3) {
      if (!form.service_category) errs.service_category = 'Select a category';
      if (!form.service_title.trim()) errs.service_title = 'Service title is required';
      if (!form.service_description.trim() || form.service_description.length < 100)
        errs.service_description = 'Please describe your service in at least 100 characters';
      if (!form.pricing_structure.trim()) errs.pricing_structure = 'Pricing structure is required';
    }
    if (step === 4) {
      const allChecked = form.agree_professional && form.agree_no_misrepresent &&
        form.agree_no_fake_reviews && form.agree_no_impersonate &&
        form.agree_support && form.agree_complaints;
      if (!allChecked) errs.standards = 'You must agree to all professional standards';
    }
    if (step === 5) {
      if (!form.payout_method) errs.payout_method = 'Select payout method';
      if (!form.payout_name.trim()) errs.payout_name = 'Account holder name is required';
      if (!form.payout_identifier.trim()) errs.payout_identifier = 'Payment identifier is required';
    }
    if (step === 6) {
      if (!form.agree_terms || !form.agree_escrow || !form.agree_fees)
        errs.agreement = 'You must accept all agreements to proceed';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 6) setStep(s => s + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setErrors({});
    
    try {
      const applicationPayload = {
        user_id: user?.id || null,
        full_name: form.full_name,
        display_name: form.display_name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        timezone: form.timezone,
        bio: form.bio,
        website: form.website,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
        facebook: form.facebook,
        linkedin: form.linkedin,
        twitter: form.twitter,
        service_category: form.service_category,
        service_title: form.service_title,
        service_description: form.service_description,
        delivery_process: form.delivery_process,
        delivery_time: form.delivery_time,
        pricing_structure: form.pricing_structure,
        refund_policy: form.refund_policy,
        expected_outcome: form.expected_outcome,
        support_method: form.support_method,
        agree_professional: form.agree_professional,
        agree_no_misrepresent: form.agree_no_misrepresent,
        agree_no_fake_reviews: form.agree_no_fake_reviews,
        agree_no_impersonate: form.agree_no_impersonate,
        agree_support: form.agree_support,
        agree_complaints: form.agree_complaints,
        payout_method: form.payout_method,
        payout_name: form.payout_name,
        payout_identifier: form.payout_identifier,
        payout_currency: form.payout_currency,
        agree_terms: form.agree_terms,
        agree_escrow: form.agree_escrow,
        agree_fees: form.agree_fees,
        status: 'pending',
      };

      const { error: appError } = await supabase
        .from('provider_applications')
        .insert(applicationPayload);

      if (appError) throw appError;

      try {
        await supabase.from('activity_feed').insert({
          type: 'provider_apply',
          title: '📋 New Provider Application',
          description: `${form.display_name} applied as ${form.service_category} provider`,
          country: form.country,
          country_flag: '📋',
          metadata: { service: form.service_category, country: form.country }
        });
      } catch (feedError) {
        console.warn("Activity feed fallback trigger:", feedError);
      }

      setSubmitted(true);
    } catch (e: any) {
      console.error("Submission operational failure:", e);
      setErrors({ submit: e?.message || 'Submission failed. Please verify your RLS permissions and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#060f1e',
    border: '1.5px solid #1a2740', borderRadius: '10px',
    padding: '13px 14px', color: 'white', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block' as const, color: '#9ca3af',
    fontSize: '12px', fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em', marginBottom: '7px'
  };

  const errStyle = { color: '#f87171', fontSize: '12px', marginTop: '5px' };

  if (submitted) {
    return (
      <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={46} color="#22c55e" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '32px', color: 'white', marginBottom: '14px', letterSpacing: '-1px' }}>Application Submitted!</h1>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: 1.7, marginBottom: '12px' }}>
            Thank you, <strong style={{ color: 'white' }}>{form.display_name}</strong>! Your application is now under review.
          </p>
          <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            {[
              { icon: '📧', text: `Confirmation sent to ${form.email}` },
              { icon: '⏱️', text: 'Review takes 24-48 business hours' },
              { icon: '🔔', text: 'You\'ll be notified of the decision' },
              { icon: '📋', text: 'Keep your service details ready' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'black', padding: '14px 28px', borderRadius: '12px', fontWeight: 900, fontSize: '15px', textDecoration: 'none' }}>
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
          <button onClick={prevStep} disabled={step === 1} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: step === 1 ? 'not-allowed' : 'pointer', color: '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
            <div style={{ width: '26px', height: '26px', background: '#22c55e', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={12} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '14px', color: 'white' }}>GLOBAL<span style={{ color: '#22c55e' }}>HUB</span></span>
          </Link>
          <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700 }}>Step {step} of 6</span>
        </div>

        {/* Progress Bar */}
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ background: '#1a2740', borderRadius: '20px', height: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '20px', transition: 'width 0.4s ease' }} />
          </div>

          {/* Indicators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {STEPS.map(s => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#22c55e' : active ? 'rgba(34,197,94,0.2)' : '#1a2740', border: `2px solid ${done ? '#22c55e' : active ? '#22c55e' : '#1a2740'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                    {done ? <CheckCircle size={14} color="black" /> : <Icon size={12} color={active ? '#22c55e' : '#374151'} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forms Router Container */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px 80px' }}>
        
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#22c55e" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Account Profile</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Tell us who you are</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Full Legal Name *</label>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" style={{ ...inputStyle, borderColor: errors.full_name ? '#f87171' : '#1a2740' }} />
                {errors.full_name && <p style={errStyle}>{errors.full_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Brand / Display Name *</label>
                <input type="text" value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="How clients will see you" style={{ ...inputStyle, borderColor: errors.display_name ? '#f87171' : '#1a2740' }} />
                {errors.display_name && <p style={errStyle}>{errors.display_name}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" style={{ ...inputStyle, borderColor: errors.email ? '#f87171' : '#1a2740' }} />
                {errors.email && <p style={errStyle}>{errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254..." style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Country *</label>
                <select value={form.country} onChange={e => set('country', e.target.value)} style={{ ...inputStyle, borderColor: errors.country ? '#f87171' : '#1a2740' }}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c, index) => <option key={`${c}-${index}`} value={c}>{c}</option>)}
                </select>
                {errors.country && <p style={errStyle}>{errors.country}</p>}
              </div>
              <div>
                <label style={labelStyle}>Timezone</label>
                <input type="text" value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="e.g. EAT, UTC+3" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Professional Bio *</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} placeholder="Describe your experience and what makes your signals/analysis valuable..." style={{ ...inputStyle, resize: 'vertical', borderColor: errors.bio ? '#f87171' : '#1a2740' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.bio && <p style={errStyle}>{errors.bio}</p>}
                <p style={{ color: form.bio.length >= 50 ? '#22c55e' : '#6b7280', fontSize: '11px', marginLeft: 'auto' }}>{form.bio.length} / 50 min</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color="#60a5fa" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Platform Presence</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Provide at least one profile presence link</p>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: '#bfdbfe', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>At least one active presence url domain parameter is requested to complete platform identity parameters verification layout.</p>
            </div>

            {[
              { key: 'website', label: 'Website / Portfolio', placeholder: 'https://yoursite.com', icon: '🌐' },
              { key: 'telegram', label: 'Telegram Channel / Group', placeholder: 'https://t.me/yourchannel', icon: '✈️' },
              { key: 'whatsapp', label: 'WhatsApp Business Link', placeholder: 'https://wa.me/...', icon: '📱' },
              { key: 'facebook', label: 'Facebook Page', placeholder: 'https://facebook.com/...', icon: '📘' },
              { key: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/...', icon: '💼' },
              { key: 'twitter', label: 'Twitter / X Profile', placeholder: 'https://x.com/...', icon: '🐦' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{field.icon} {field.label}</label>
                <input type="text" value={(form as Record<string, any>)[field.key]} onChange={e => set(field.key as keyof FormData, e.target.value)} placeholder={field.placeholder} style={inputStyle} />
              </div>
            ))}
            {errors.website && <p style={errStyle}>⚠️ {errors.website}</p>}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#fbbf24" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Service Details</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Tell buyers exactly what you offer</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Service Category *</label>
              <select value={form.service_category} onChange={e => set('service_category', e.target.value)} style={{ ...inputStyle, borderColor: errors.service_category ? '#f87171' : '#1a2740' }}>
                <option value="">Select category...</option>
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.service_category && <p style={errStyle}>{errors.service_category}</p>}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Service Title *</label>
              <input type="text" value={form.service_title} onChange={e => set('service_title', e.target.value)} placeholder="e.g. VIP Accurate Premium Signals" style={{ ...inputStyle, borderColor: errors.service_title ? '#f87171' : '#1a2740' }} />
              {errors.service_title && <p style={errStyle}>{errors.service_title}</p>}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Detailed Service Description * (min 100 chars)</label>
              <textarea value={form.service_description} onChange={e => set('service_description', e.target.value)} rows={4} placeholder="Describe your system accuracy setup mechanics or analysis methodology layers..." style={{ ...inputStyle, resize: 'vertical', borderColor: errors.service_description ? '#f87171' : '#1a2740' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.service_description && <p style={errStyle}>{errors.service_description}</p>}
                <p style={{ color: form.service_description.length >= 100 ? '#22c55e' : '#6b7280', fontSize: '11px', marginLeft: 'auto' }}>{form.service_description.length} / 100 min</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Delivery Process</label>
                <input type="text" value={form.delivery_process} onChange={e => set('delivery_process', e.target.value)} placeholder="e.g. Private Telegram Link" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Average Delivery Time</label>
                <input type="text" value={form.delivery_time} onChange={e => set('delivery_time', e.target.value)} placeholder="e.g. Daily, Instant" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Pricing Structure *</label>
              <textarea value={form.pricing_structure} onChange={e => set('pricing_structure', e.target.value)} rows={2} placeholder="e.g. Weekly plans $15, Monthly plans $45" style={{ ...inputStyle, resize: 'vertical', borderColor: errors.pricing_structure ? '#f87171' : '#1a2740' }} />
              {errors.pricing_structure && <p style={errStyle}>{errors.pricing_structure}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Refund Policy</label>
                <input type="text" value={form.refund_policy} onChange={e => set('refund_policy', e.target.value)} placeholder="Terms for cancellation" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Support Method</label>
                <input type="text" value={form.support_method} onChange={e => set('support_method', e.target.value)} placeholder="Direct Telegram DM" style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} color="#a78bfa" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Professional Standards</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Review and confirm your commitments</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'agree_professional', text: 'I will communicate professionally with all clients and respond within a reasonable time.' },
                { key: 'agree_no_misrepresent', text: 'I will not misrepresent my services, historical win rates, or track records.' },
                { key: 'agree_no_fake_reviews', text: 'I will not use fake reviews or fabricated metrics.' },
                { key: 'agree_no_impersonate', text: 'I will not impersonate another trader, individual, or established platform brand.' },
                { key: 'agree_support', text: 'I will provide authentic support channels for all paying buyers.' },
                { key: 'agree_complaints', text: 'I understand that high marketplace dispute ratios can lead to provider onboarding suspension.' },
              ].map(item => {
                const checked = (form as Record<string, any>)[item.key];
                return (
                  <div key={item.key} onClick={() => set(item.key as keyof FormData, !checked)} style={{ display: 'flex', gap: '14px', alignItems: 'center', background: checked ? 'rgba(34,197,94,0.05)' : '#0a1628', border: `1px solid ${checked ? 'rgba(34,197,94,0.25)' : '#1a2740'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${checked ? '#22c55e' : '#374151'}`, background: checked ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {checked && <CheckCircle size={12} color="black" />}
                    </div>
                    <p style={{ color: checked ? '#86efac' : '#9ca3af', fontSize: '14px', margin: 0 }}>{item.text}</p>
                  </div>
                );
              })}
            </div>
            {errors.standards && <p style={errStyle}>⚠️ {errors.standards}</p>}
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#22c55e" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Payout Configuration</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Configure how you will receive funds payout matrix</p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Payout Method *</label>
              <select value={form.payout_method} onChange={e => set('payout_method', e.target.value)} style={{ ...inputStyle, borderColor: errors.payout_method ? '#f87171' : '#1a2740' }}>
                <option value="">Select method...</option>
                <option value="mpesa">M-Pesa Mobile Money</option>
                <option value="airtel">Airtel Money</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Crypto Wallet (USDT)</option>
              </select>
              {errors.payout_method && <p style={errStyle}>{errors.payout_method}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Account Holder Name *</label>
                <input type="text" value={form.payout_name} onChange={e => set('payout_name', e.target.value)} placeholder="Full legal name on account" style={{ ...inputStyle, borderColor: errors.payout_name ? '#f87171' : '#1a2740' }} />
                {errors.payout_name && <p style={errStyle}>{errors.payout_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Payment Identifier *</label>
                <input type="text" value={form.payout_identifier} onChange={e => set('payout_identifier', e.target.value)} placeholder="Mobile Number or Wallet Address" style={{ ...inputStyle, borderColor: errors.payout_identifier ? '#f87171' : '#1a2740' }} />
                {errors.payout_identifier && <p style={errStyle}>{errors.payout_identifier}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 6 */}
        {step === 6 && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#22c55e" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '2px' }}>Final Onboarding Agreements</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>Accept marketplace architecture terms</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { key: 'agree_terms', label: 'GlobalHub Provider Terms of Service', text: 'I agree to the platform provider terms and general rules.' },
                { key: 'agree_escrow', label: 'Escrow & Safety Payment Policy', text: 'I understand payments are held in escrow safely until delivery verification rules confirm service parameters.' },
                { key: 'agree_fees', label: 'Platform Fee Structure Agreement', text: 'I acknowledge the default platform service cuts applied on completed order payments.' },
              ].map(item => {
                const checked = (form as Record<string, any>)[item.key];
                return (
                  <div key={item.key} onClick={() => set(item.key as keyof FormData, !checked)} style={{ background: '#0a1628', border: `1px solid ${checked ? '#22c55e' : '#1a2740'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#22c55e' }}>{item.label}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{item.text}</p>
                  </div>
                );
              })}
            </div>
            {errors.agreement && <p style={errStyle}>⚠️ {errors.agreement}</p>}
            {errors.submit && <p style={{ ...errStyle, fontSize: '14px', background: 'rgba(248,113,113,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.2)', marginBottom: '16px' }}>{errors.submit}</p>}
          </div>
        )}

        {/* Footer Navigation Sticky Triggers */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0a1628', borderTop: '1px solid #1a2740', padding: '16px', zIndex: 40 }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <button onClick={prevStep} disabled={step === 1} style={{ flex: 1, background: '#1a2740', color: step === 1 ? '#4b5563' : 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '15px', cursor: step === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button onClick={next} disabled={submitting} style={{ flex: 2, background: '#22c55e', color: 'black', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 900, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? 'Processing Application...' : step === 6 ? <>Submit Application <CheckCircle size={16} /></> : <>Next Step <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
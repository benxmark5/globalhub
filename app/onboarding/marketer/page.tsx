// app/onboarding/marketer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, ArrowRight, CheckCircle, User, Globe,
  Users, FileText, Sparkles, Copy, Share2, TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { id: 1, label: 'Profile',   icon: User },
  { id: 2, label: 'Promotion', icon: Share2 },
  { id: 3, label: 'Agreement', icon: FileText },
];

const PROMOTION_CHANNELS = [
  { key: 'social_media',    label: 'Social Media', desc: 'Twitter/X, Instagram, TikTok, Facebook' },
  { key: 'whatsapp',        label: 'WhatsApp groups', desc: 'Personal networks and community groups' },
  { key: 'youtube',         label: 'YouTube / Video', desc: 'YouTube channel or short-form video' },
  { key: 'blog',            label: 'Blog / Website', desc: 'Written content, SEO, or a website you own' },
  { key: 'in_person',       label: 'In-person / Word of mouth', desc: 'Direct referrals, meetups, offline networks' },
  { key: 'paid_ads',        label: 'Paid advertising', desc: 'Facebook ads, Google ads, etc.' },
];

type PromotionChannel = typeof PROMOTION_CHANNELS[number]['key'];

type FormData = {
  full_name: string;
  display_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  audience_size: string;
  channels: PromotionChannel[];
  agree_terms: boolean;
  agree_no_fake: boolean;
  agree_attribution: boolean;
};

const INITIAL: FormData = {
  full_name: '', display_name: '', email: '', phone: '',
  country: 'ZW', city: '', bio: '', audience_size: '',
  channels: [],
  agree_terms: false, agree_no_fake: false, agree_attribution: false,
};

const ZW_CITIES = [
  'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru',
  'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Marondera',
  'Norton', 'Bindura', 'Beitbridge', 'Victoria Falls', 'Hwange', 'Other',
];

export default function MarketerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

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

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key as string]; return n; });
  };

  const toggleChannel = (ch: PromotionChannel) => {
    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch],
    }));
    setErrors(prev => { const n = { ...prev }; delete n.channels; return n; });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.full_name.trim()) errs.full_name = 'Full name is required';
      if (!form.display_name.trim()) errs.display_name = 'Display name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      if (!form.city) errs.city = 'City is required';
      if (!form.bio.trim() || form.bio.length < 30) errs.bio = 'Bio is required (min 30 chars)';
    }
    if (step === 2) {
      if (form.channels.length === 0) errs.channels = 'Select at least one promotion channel';
      if (!form.audience_size.trim()) errs.audience_size = 'Audience size is required';
    }
    if (step === 3) {
      if (!form.agree_terms || !form.agree_no_fake || !form.agree_attribution) {
        errs.agreement = 'You must accept all agreements';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const prevStep = () => { if (step > 1) setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true); setErrors({});
    try {
      const res = await fetch('/api/onboarding/marketer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          display_name: form.display_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
          bio: form.bio,
          audience_size: form.audience_size,
          channels: form.channels,
          agree_terms: form.agree_terms,
          agree_no_fake: form.agree_no_fake,
          agree_attribution: form.agree_attribution,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setReferralCode(data.referral_code || '');
      setSubmitted(true);
    } catch (e: any) {
      setErrors({ submit: e?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#060f1e',
    border: '1.5px solid #1a2740', borderRadius: '10px',
    padding: '13px 14px', color: 'white', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#9ca3af',
    fontSize: '12px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '7px',
  };
  const errStyle: React.CSSProperties = { color: '#f87171', fontSize: '12px', marginTop: '5px' };

  // Success screen
  if (submitted) {
    const shareLink = referralCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}` : '';
    return (
      <div style={{ minHeight: '100dvh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', background: 'rgba(167,139,250,0.1)', border: '2px solid rgba(167,139,250,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <CheckCircle size={46} color="#a78bfa" />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '32px', color: 'white', marginBottom: '14px', letterSpacing: '-1px' }}>
            Marketer Application Submitted
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
            Your application is under review. Here's your referral code — you can start sharing now.
          </p>

          {/* Referral code card */}
          {referralCode && (
            <div style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(139,92,246,0.08))', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={14} color="#a78bfa" />
                <span style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Your referral code
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '2px', marginBottom: '16px' }}>
                {referralCode}
              </div>
              <button
                onClick={copyCode}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#a78bfa', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '13px', cursor: 'pointer' }}
              >
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy code'}
              </button>
              {shareLink && (
                <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', wordBreak: 'break-all' }}>
                  {shareLink}
                </div>
              )}
            </div>
          )}

          <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '14px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            {[
              { icon: '⏳', text: 'Review takes 24–48 hours' },
              { icon: '🔗', text: 'Referral link activates after approval' },
              { icon: '📊', text: 'Track clicks and conversions in your dashboard' },
              { icon: '💰', text: 'Commission on every purchase by your referrals' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply/status" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd', padding: '12px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', textDecoration: 'none' }}>
              Check Status
            </Link>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a78bfa', color: 'black', padding: '12px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', textDecoration: 'none' }}>
              <Trophy size={14} /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / 2) * 100;

  return (
    <div style={{ minHeight: '100dvh', background: '#060f1e', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={prevStep} disabled={step === 1} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: step === 1 ? 'not-allowed' : 'pointer', color: step === 1 ? '#374151' : '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
            <ArrowLeft size={15} /> Back
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
            <div style={{ width: '26px', height: '26px', background: '#a78bfa', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={12} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '14px', color: 'white' }}>
              GLOBAL<span style={{ color: '#a78bfa' }}>HUB</span>
            </span>
          </Link>
          <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700 }}>Marketer · Step {step} of 3</span>
        </div>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ background: '#1a2740', borderRadius: '20px', height: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)', borderRadius: '20px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', maxWidth: '300px', margin: '10px auto 0' }}>
            {STEPS.map(s => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#a78bfa' : active ? 'rgba(167,139,250,0.2)' : '#1a2740', border: `2px solid ${done ? '#a78bfa' : active ? '#a78bfa' : '#1a2740'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done ? <CheckCircle size={14} color="black" /> : <Icon size={12} color={active ? '#a78bfa' : '#374151'} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* Step 1 — Profile */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Your profile</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Tell us about yourself</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your real name" style={{ ...inputStyle, borderColor: errors.full_name ? '#f87171' : '#1a2740' }} />
                {errors.full_name && <p style={errStyle}>{errors.full_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Display Name *</label>
                <input type="text" value={form.display_name} onChange={e => set('display_name', e.target.value)} placeholder="Public marketer name" style={{ ...inputStyle, borderColor: errors.display_name ? '#f87171' : '#1a2740' }} />
                {errors.display_name && <p style={errStyle}>{errors.display_name}</p>}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={{ ...inputStyle, borderColor: errors.email ? '#f87171' : '#1a2740' }} />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+263..." style={inputStyle} />
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
              <label style={labelStyle}>Short Bio * (min 30 chars)</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Tell us about your audience and how you plan to promote GlobalHub..." style={{ ...inputStyle, resize: 'vertical', borderColor: errors.bio ? '#f87171' : '#1a2740' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {errors.bio && <p style={errStyle}>{errors.bio}</p>}
                <p style={{ color: form.bio.length >= 30 ? '#22c55e' : '#6b7280', fontSize: '11px', marginLeft: 'auto' }}>{form.bio.length} / 30 min</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Promotion */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={20} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Promotion strategy</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>How will you promote GlobalHub?</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Channels * (select all that apply)</label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {PROMOTION_CHANNELS.map(ch => {
                  const selected = form.channels.includes(ch.key);
                  return (
                    <div
                      key={ch.key}
                      onClick={() => toggleChannel(ch.key)}
                      style={{
                        padding: '14px 16px',
                        background: selected ? 'rgba(167,139,250,0.1)' : '#0a1628',
                        border: `1.5px solid ${selected ? '#a78bfa' : '#1a2740'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${selected ? '#a78bfa' : '#374151'}`, background: selected ? '#a78bfa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selected && <CheckCircle size={12} color="black" />}
                      </div>
                      <div>
                        <p style={{ color: selected ? 'white' : '#9ca3af', fontSize: '14px', fontWeight: 700, margin: 0 }}>{ch.label}</p>
                        <p style={{ color: selected ? '#c4b5fd' : '#6b7280', fontSize: '12px', margin: 0 }}>{ch.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.channels && <p style={errStyle}>{errors.channels}</p>}
            </div>

            <div>
              <label style={labelStyle}>Estimated audience size *</label>
              <select value={form.audience_size} onChange={e => set('audience_size', e.target.value)} style={{ ...inputStyle, borderColor: errors.audience_size ? '#f87171' : '#1a2740' }}>
                <option value="">Select range...</option>
                <option value="0-100">Less than 100 followers</option>
                <option value="100-1000">100 – 1,000 followers</option>
                <option value="1000-10000">1,000 – 10,000 followers</option>
                <option value="10000-100000">10,000 – 100,000 followers</option>
                <option value="100000+">100,000+ followers</option>
              </select>
              {errors.audience_size && <p style={errStyle}>{errors.audience_size}</p>}
            </div>
          </div>
        )}

        {/* Step 3 — Agreement */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: '20px', margin: 0 }}>Final agreements</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Confirm your commitments</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'agree_terms' as const,       title: 'Marketer Terms', body: 'I accept the GlobalHub marketer program terms and commission structure.' },
                { key: 'agree_no_fake' as const,     title: 'No fake referrals', body: 'I will not use bots, fake accounts, or fraudulent methods to generate referrals.' },
                { key: 'agree_attribution' as const, title: 'Attribution rules', body: 'I understand referrals are only credited when new customers sign up AND make their first purchase within the attribution window.' },
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
          <button onClick={prevStep} disabled={step === 1 || submitting} style={{ flex: 1, padding: '14px 20px', background: step === 1 ? '#0a1628' : '#1a2740', border: `1px solid ${step === 1 ? '#0a1628' : '#374151'}`, color: step === 1 ? '#374151' : '#9ca3af', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: step === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Previous
          </button>
          <button onClick={next} disabled={submitting} style={{ flex: 2, padding: '14px 20px', background: submitting ? '#1a2740' : 'linear-gradient(90deg, #8b5cf6, #a78bfa)', border: 'none', color: submitting ? '#6b7280' : 'black', borderRadius: '12px', fontWeight: 900, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {submitting ? 'Submitting…' : step === 3 ? (<>Submit Application <CheckCircle size={16} /></>) : (<>Next Step <ArrowRight size={16} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}
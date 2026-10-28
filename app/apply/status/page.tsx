// app/apply/status/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy, Loader2, ArrowRight, CheckCircle, Clock, XCircle,
  AlertCircle, Briefcase, Users, TrendingUp, FileText, Copy,
  ShieldCheck, RotateCcw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type KycCounts = { total: number; verified: number; pending: number; rejected: number };

type ProviderApp = {
  id: string;
  display_name: string;
  service_category: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  provider_level: string | null;
  trust_score: number | null;
  kyc: KycCounts;
};

type VendorApp = {
  id: string;
  display_name: string | null;
  legal_name: string;
  entity_type: string;
  city: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  kyc: KycCounts;
};

type MarketerApp = {
  id: string;
  display_name: string;
  referral_code: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  total_conversions: number;
  pending_earnings: number;
};

type Payload = {
  user: { email: string };
  provider: ProviderApp[];
  vendor: VendorApp[];
  marketer: MarketerApp[];
};

const STATUS_THEME: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending:          { label: 'Pending',          bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.3)',  icon: Clock },
  application_started: { label: 'Started',       bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', icon: Clock },
  documents_submitted: { label: 'Docs submitted',bg: 'rgba(96,165,250,0.1)',  text: '#60a5fa', border: 'rgba(96,165,250,0.3)',  icon: FileText },
  under_review:     { label: 'Under review',     bg: 'rgba(139,92,246,0.1)',  text: '#a78bfa', border: 'rgba(139,92,246,0.3)',  icon: Clock },
  info_required:    { label: 'Info required',    bg: 'rgba(249,115,22,0.1)',  text: '#f97316', border: 'rgba(249,115,22,0.3)',  icon: AlertCircle },
  approved:         { label: 'Approved',         bg: 'rgba(34,197,94,0.1)',   text: '#22c55e', border: 'rgba(34,197,94,0.3)',   icon: CheckCircle },
  rejected:         { label: 'Rejected',         bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.3)', icon: XCircle },
  suspended:        { label: 'Suspended',        bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', icon: XCircle },
};

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ApplyStatusPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      setAuthed(true);
      loadStatus();
    });
  }, []);

  const loadStatus = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/apply/status', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json as Payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  };

  if (loading && authed === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#060f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" color="#22c55e" />
      </div>
    );
  }

  if (authed === false) {
    return (
      <div style={{ minHeight: '100vh', background: '#060f1e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Trophy size={36} color="#22c55e" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '12px' }}>Sign in to check status</h1>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            Your application status is tied to your account. Sign in to see progress.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/login" style={{ background: '#22c55e', color: 'black', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, fontSize: '14px', textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link href="/register" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalApps = (data?.provider.length ?? 0) + (data?.vendor.length ?? 0) + (data?.marketer.length ?? 0);
  const noApps = totalApps === 0;

  return (
    <div style={{ minHeight: '100vh', background: '#060f1e', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={14} color="black" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '16px', color: 'white' }}>
                GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
              </span>
            </Link>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>Your applications</h1>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            {data?.user.email}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px', marginBottom: '20px' }}>
            <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>
          </div>
        )}

        {noApps ? (
          <div style={{ padding: '40px 20px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '16px', textAlign: 'center' }}>
            <Trophy size={40} color="#22c55e" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>No applications yet</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
              You haven't applied as a partner yet. Explore the 3 ways to partner with GlobalHub.
            </p>
            <Link href="/company" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'black', padding: '12px 24px', borderRadius: '12px', fontWeight: 900, fontSize: '14px', textDecoration: 'none' }}>
              Explore Partner Programs <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* MARKETER applications */}
            {data?.marketer.map(m => {
              const theme = STATUS_THEME[m.status] ?? STATUS_THEME.pending;
              const Icon = theme.icon;
              return (
                <div key={m.id} style={{ background: '#0a1628', border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} color="#a78bfa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Marketer</p>
                      <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{m.display_name}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px' }}>
                      <Icon size={12} color={theme.text} />
                      <span style={{ color: theme.text, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{theme.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Referral code</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: 'white' }}>{m.referral_code}</code>
                        <button
                          onClick={() => copyCode(m.referral_code)}
                          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
                        >
                          <Copy size={12} />
                        </button>
                        {copied === m.referral_code && <span style={{ fontSize: '10px', color: '#22c55e' }}>copied</span>}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Submitted</p>
                      <p style={{ fontSize: '14px', color: 'white' }}>{relativeTime(m.created_at)}</p>
                    </div>
                  </div>

                  {m.status === 'approved' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#86efac', margin: 0 }}>
                        <strong>{m.total_conversions ?? 0}</strong> conversions · <strong>${Number(m.pending_earnings ?? 0).toFixed(2)}</strong> pending
                      </p>
                      <Link href="/partner/marketer" style={{ fontSize: '12px', color: '#86efac', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Dashboard <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}

                  {m.status === 'rejected' && m.rejection_reason && (
                    <div style={{ padding: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0 }}><strong>Reason:</strong> {m.rejection_reason}</p>
                    </div>
                  )}

                  {m.status === 'pending' && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontStyle: 'italic' }}>
                      Review takes 24–48 hours. You'll get an email once approved.
                    </p>
                  )}
                </div>
              );
            })}

            {/* VENDOR applications */}
            {data?.vendor.map(v => {
              const theme = STATUS_THEME[v.status] ?? STATUS_THEME.pending;
              const Icon = theme.icon;
              return (
                <div key={v.id} style={{ background: '#0a1628', border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={20} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Vendor</p>
                      <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{v.display_name || v.legal_name}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px' }}>
                      <Icon size={12} color={theme.text} />
                      <span style={{ color: theme.text, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{theme.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Entity</p>
                      <p style={{ fontSize: '13px', color: 'white', textTransform: 'capitalize' }}>{v.entity_type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>City</p>
                      <p style={{ fontSize: '13px', color: 'white' }}>{v.city || '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Submitted</p>
                      <p style={{ fontSize: '13px', color: 'white' }}>{relativeTime(v.created_at)}</p>
                    </div>
                  </div>

                  {/* KYC status */}
                  {v.kyc.total > 0 && (
                    <div style={{ padding: '10px', background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: v.status === 'approved' ? '10px' : 0 }}>
                      <ShieldCheck size={14} color="#60a5fa" />
                      <p style={{ fontSize: '12px', color: '#93c5fd', margin: 0 }}>
                        Identity verification: <strong>{v.kyc.verified} of {v.kyc.total}</strong> verified
                        {v.kyc.pending > 0 && <> · {v.kyc.pending} pending</>}
                        {v.kyc.rejected > 0 && <> · <span style={{ color: '#f87171' }}>{v.kyc.rejected} rejected</span></>}
                      </p>
                    </div>
                  )}

                  {v.status === 'approved' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#86efac', margin: 0 }}>Approved {relativeTime(v.approved_at)}</p>
                      <Link href="/partner/vendor" style={{ fontSize: '12px', color: '#86efac', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Dashboard <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}

                  {v.status === 'rejected' && v.rejection_reason && (
                    <div style={{ padding: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0 }}><strong>Reason:</strong> {v.rejection_reason}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* PROVIDER applications */}
            {data?.provider.map(p => {
              const theme = STATUS_THEME[p.status] ?? STATUS_THEME.pending;
              const Icon = theme.icon;
              return (
                <div key={p.id} style={{ background: '#0a1628', border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #22c55e, #4ade80)' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} color="#22c55e" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Provider</p>
                      <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{p.display_name}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '20px' }}>
                      <Icon size={12} color={theme.text} />
                      <span style={{ color: theme.text, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{theme.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Category</p>
                      <p style={{ fontSize: '13px', color: 'white' }}>{p.service_category}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Level</p>
                      <p style={{ fontSize: '13px', color: 'white', textTransform: 'capitalize' }}>{p.provider_level || 'Verified'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>Submitted</p>
                      <p style={{ fontSize: '13px', color: 'white' }}>{relativeTime(p.created_at)}</p>
                    </div>
                  </div>

                  {p.kyc.total > 0 && (
                    <div style={{ padding: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: p.status === 'approved' ? '10px' : 0 }}>
                      <ShieldCheck size={14} color="#22c55e" />
                      <p style={{ fontSize: '12px', color: '#86efac', margin: 0 }}>
                        Identity verification: <strong>{p.kyc.verified} of {p.kyc.total}</strong> verified
                        {p.kyc.pending > 0 && <> · {p.kyc.pending} pending</>}
                        {p.kyc.rejected > 0 && <> · <span style={{ color: '#f87171' }}>{p.kyc.rejected} rejected</span></>}
                      </p>
                    </div>
                  )}

                  {p.status === 'approved' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#86efac', margin: 0 }}>Approved {relativeTime(p.reviewed_at)}</p>
                      <Link href="/partner/provider" style={{ fontSize: '12px', color: '#86efac', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Dashboard <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}

                  {p.status === 'rejected' && p.rejection_reason && (
                    <div style={{ padding: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0 }}><strong>Reason:</strong> {p.rejection_reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/company" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '13px', textDecoration: 'none', padding: '8px 16px', border: '1px solid #1a2740', borderRadius: '10px' }}>
            <RotateCcw size={12} /> Explore other programs
          </Link>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '13px', textDecoration: 'none', padding: '8px 16px', border: '1px solid #1a2740', borderRadius: '10px' }}>
            Home <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
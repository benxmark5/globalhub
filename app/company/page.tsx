// app/company/page.tsx
'use client';

import Link from 'next/link';
import {
  ArrowRight, Trophy, Briefcase, Users, Sparkles, CheckCircle,
  ShieldCheck, TrendingUp, Zap, Globe, DollarSign,
} from 'lucide-react';

type Role = {
  key: 'provider' | 'vendor' | 'marketer';
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  gradient: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  href: string;
  cta: string;
};

const ROLES: Role[] = [
  {
    key: 'provider',
    icon: Trophy,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
    title: 'Provider',
    tagline: 'Sell services & signals',
    description:
      'Offer football signals, trading insights, digital products, or coaching. Get paid when clients subscribe. Escrow-protected.',
    bullets: [
      'Weekly / monthly subscription revenue',
      'Escrow-secured payouts',
      'Trust badges as you grow',
      'Analytics dashboard',
    ],
    href: '/onboarding',
    cta: 'Apply as Provider',
  },
  {
    key: 'vendor',
    icon: Briefcase,
    color: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    title: 'Vendor',
    tagline: 'Collect deposits for GlobalHub',
    description:
      'Become an authorized collection agent. Accept customer deposits, remit to GlobalHub, and earn on every verified collection.',
    bullets: [
      'Zimbabwe EcoCash / bank collection',
      'Weekly settlement cycle',
      'Full or net remittance model',
      'Real-time collection dashboard',
    ],
    href: '/onboarding/vendor',
    cta: 'Apply as Vendor',
  },
  {
    key: 'marketer',
    icon: Users,
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    title: 'Marketer',
    tagline: 'Earn from referrals',
    description:
      'Share your unique referral link. Earn commission when new customers sign up and make their first purchase. Track everything live.',
    bullets: [
      'Unique MARK-XXXXXX code',
      'Commission on signups + purchases',
      'Real-time referral dashboard',
      'Monthly payouts',
    ],
    href: '/onboarding/marketer',
    cta: 'Apply as Marketer',
  },
];

export default function CompanyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060f1e', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid #1a2740', background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', background: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={14} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '16px', color: 'white' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <span style={{ color: '#4b5563', fontSize: '13px' }}>·</span>
          <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600 }}>Partner program</span>
          <Link
            href="/"
            style={{ marginLeft: 'auto', color: '#9ca3af', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto', padding: '60px 20px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', marginBottom: '20px' }}>
          <Sparkles size={14} color="#22c55e" />
          <span style={{ color: '#86efac', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
            THREE WAYS TO PARTNER WITH GLOBALHUB
          </span>
        </div>
        <h1 style={{ fontSize: '44px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '16px', color: 'white' }}>
          Become a <span style={{ background: 'linear-gradient(135deg, #22c55e, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GlobalHub Partner</span>
        </h1>
        <p style={{ fontSize: '17px', color: '#9ca3af', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
          Join a growing network of providers, vendors, and marketers earning on Africa's most trusted fintech & gaming platform.
        </p>
      </div>

      {/* Three role cards */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {ROLES.map(role => {
            const Icon = role.icon;
            return (
              <div
                key={role.key}
                style={{
                  position: 'relative',
                  background: 'linear-gradient(180deg, rgba(15,31,51,0.95), rgba(10,22,40,0.95))',
                  border: '1px solid #1a2740',
                  borderRadius: '20px',
                  padding: '28px 24px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = role.color + '80';
                  e.currentTarget.style.boxShadow = `0 20px 40px -10px ${role.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#1a2740';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: role.gradient }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: `${role.color}20`,
                    border: `1px solid ${role.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 24px ${role.color}30`,
                  }}>
                    <Icon size={24} color={role.color} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: 'white' }}>{role.title}</h2>
                    <p style={{ fontSize: '12px', color: role.color, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{role.tagline}</p>
                  </div>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '18px' }}>
                  {role.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {role.bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', color: '#d1d5db', fontSize: '13px' }}>
                      <CheckCircle size={14} color={role.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={role.href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px 20px',
                    background: role.gradient,
                    color: 'black',
                    borderRadius: '12px',
                    fontWeight: 900,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {role.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{
          background: 'rgba(15,31,51,0.6)',
          border: '1px solid #1a2740',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {[
            { icon: ShieldCheck, label: 'Escrow-protected payouts', color: '#22c55e' },
            { icon: Zap, label: 'Weekly settlement cycle', color: '#fbbf24' },
            { icon: Globe, label: 'Pan-African reach', color: '#60a5fa' },
            { icon: DollarSign, label: 'Commission-based earnings', color: '#a78bfa' },
          ].map(({ icon: I, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <I size={18} color={color} />
              <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Already applied link */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
          Already applied?
        </p>
        <Link
          href="/apply/status"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.3)',
            color: '#93c5fd',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Check your application status
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
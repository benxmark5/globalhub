"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Trophy, Star, Shield, TrendingUp,
  Users, DollarSign, CheckCircle,
  ArrowRight, Globe, Zap, Award,
  Lock, ChevronRight, BarChart3
} from 'lucide-react';

export default function BecomeProviderPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Animate counter
    const target = 12847;
    const step = Math.ceil(target / 80);
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(timer); return target; }
        return prev + step;
      });
    }, 20);
    return () => clearInterval(timer);
  }, []);

  const benefits = [
    { icon: DollarSign, color: '#22c55e', title: 'Earn Globally', desc: 'Accept payments from 100+ countries. Get paid in your preferred currency via bank, M-Pesa, or mobile money.' },
    { icon: Shield, color: '#60a5fa', title: 'Protected by Escrow', desc: 'All client funds are held securely by GlobalHub until service delivery is confirmed. You always get paid.' },
    { icon: Globe, color: '#fbbf24', title: 'Global Reach', desc: 'Your services are instantly visible to thousands of verified buyers across 100+ countries worldwide.' },
    { icon: BarChart3, color: '#a78bfa', title: 'Analytics Dashboard', desc: 'Track earnings, orders, customer reviews, and performance metrics in real-time from your seller dashboard.' },
    { icon: Award, color: '#f87171', title: 'Trust Badges', desc: 'Earn Verified, Trusted, Premium, and Elite badges as you grow. Higher badges unlock better visibility.' },
    { icon: Zap, color: '#34d399', title: 'Instant Notifications', desc: 'Get real-time alerts for new orders, messages, and payments. Never miss a business opportunity.' },
  ];

  const levels = [
    { badge: '🟢', name: 'Verified Provider', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', req: 'Complete onboarding & identity verification', perks: ['Basic listing', 'Standard payouts', 'Customer messaging'] },
    { badge: '🔵', name: 'Trusted Provider', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', req: '10+ completed orders · 4.5+ rating', perks: ['Priority listing', 'Faster payouts', 'Trusted badge'] },
    { badge: '🟣', name: 'Premium Provider', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', req: '50+ orders · 4.8+ rating · <5% disputes', perks: ['Featured placement', 'Same-day payouts', 'Premium badge'] },
    { badge: '⭐', name: 'Elite Provider', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', req: '200+ orders · 4.9+ rating · Top performer', perks: ['Top placement', 'Instant payouts', 'Elite badge + perks'] },
  ];

  const steps = [
    { n: '01', title: 'Create Account', desc: 'Sign up or log in to your GlobalHub account to begin the application.', icon: '👤' },
    { n: '02', title: 'Complete Profile', desc: 'Add your professional details, photo, and service description.', icon: '📋' },
    { n: '03', title: 'Verify Identity', desc: 'Submit platform presence and service verification documents.', icon: '✅' },
    { n: '04', title: 'Sign Agreement', desc: 'Review and accept GlobalHub Provider Terms and Escrow Policy.', icon: '📝' },
    { n: '05', title: 'Get Reviewed', desc: 'Our team reviews your application within 24-48 hours.', icon: '🔍' },
    { n: '06', title: 'Start Earning', desc: 'Get approved, list your services, and start receiving orders.', icon: '🚀' },
  ];

  const faqs = [
    { q: 'How does GlobalHub protect my earnings?', a: 'All customer payments are held in escrow by GlobalHub. Once you deliver the service and it is verified, your earnings are released within 24-48 hours.' },
    { q: 'What fees does GlobalHub charge?', a: 'GlobalHub charges a 15% platform service fee on completed transactions. This covers payment processing, fraud prevention, support infrastructure, and platform maintenance.' },
    { q: 'How long does approval take?', a: 'Most applications are reviewed within 24-48 business hours. You will receive an email notification with the decision and next steps.' },
    { q: 'Can I sell any type of service?', a: 'GlobalHub accepts legitimate digital services and products. All services must comply with our Provider Agreement. Fraudulent or misleading services are strictly prohibited.' },
    { q: 'How and when do I get paid?', a: 'Payments are released to your preferred payout method (bank transfer, M-Pesa, mobile money) after service delivery confirmation. Payout frequency depends on your provider level.' },
    { q: 'What happens if a customer disputes an order?', a: 'GlobalHub has a structured dispute resolution process. Both parties present evidence. Our team makes a fair decision within 72 hours. Repeated disputes affect your Trust Score.' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#060f1e',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,15,30,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '60px'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            textDecoration: 'none'
          }}>
            <div style={{ width: '32px', height: '32px', background: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={16} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '17px', color: 'white' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/login" style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '7px 14px' }}>
              Sign In
            </Link>
            <Link href="/onboarding" style={{
              background: '#22c55e', color: 'black',
              padding: '9px 20px', borderRadius: '10px',
              fontWeight: 900, fontSize: '13px', textDecoration: 'none'
            }}>
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #060f1e 100%)',
        padding: '80px 16px 60px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '20px', padding: '7px 16px',
          marginBottom: '28px'
        }}>
          <span style={{ width: '7px', height: '7px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Now Accepting Provider Applications
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 58px)',
          fontWeight: 900, letterSpacing: '-2px',
          lineHeight: 1.05, marginBottom: '20px',
          maxWidth: '780px', margin: '0 auto 20px'
        }}>
          Sell Your Services to a{' '}
          <span style={{
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Global Audience
          </span>
        </h1>

        <p style={{
          color: '#9ca3af', fontSize: 'clamp(15px, 2vw, 18px)',
          lineHeight: 1.7, maxWidth: '580px',
          margin: '0 auto 36px'
        }}>
          Join {count.toLocaleString()}+ providers earning on GlobalHub.
          Protected by escrow. Backed by our trust system.
          Reach buyers in 100+ countries.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <Link href="/onboarding" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'black', padding: '16px 32px', borderRadius: '12px',
            fontWeight: 900, fontSize: '16px', textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(34,197,94,0.3)'
          }}>
            Start Your Application
            <ArrowRight size={18} />
          </Link>
          <a href="#how-it-works" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'transparent', color: '#9ca3af',
            padding: '16px 28px', borderRadius: '12px',
            fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            border: '1px solid #1a2740'
          }}>
            See How It Works
          </a>
        </div>

        {/* Trust stats */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '40px', flexWrap: 'wrap'
        }}>
          {[
            { v: '100+', l: 'Countries' },
            { v: '15%', l: 'Platform Fee' },
            { v: '24-48h', l: 'Review Time' },
            { v: '🔒', l: 'Escrow Protected' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'monospace', color: '#22c55e' }}>{s.v}</p>
              <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ padding: '80px 16px', background: '#060f1e' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
              Everything You Need to Succeed
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '16px' }}>
              Built for serious service providers who want to grow globally
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {benefits.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.title} style={{
                  background: '#0a1628',
                  border: '1px solid #1a2740',
                  borderRadius: '16px', padding: '24px',
                  transition: 'border-color 0.2s'
                }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: `${b.color}15`,
                    border: `1px solid ${b.color}30`,
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginBottom: '16px'
                  }}>
                    <Icon size={22} color={b.color} />
                  </div>
                  <h3 style={{ fontWeight: 900, fontSize: '16px', marginBottom: '8px' }}>{b.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Provider Levels ── */}
      <section style={{
        padding: '80px 16px',
        background: 'linear-gradient(180deg, #060f1e 0%, #0a1628 100%)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
              Provider Level System
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '15px' }}>
              Your level grows with your reputation. Higher levels unlock better rewards.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {levels.map((level, i) => (
              <div key={level.name} style={{
                background: level.bg,
                border: `1px solid ${level.color}30`,
                borderRadius: '14px', padding: '20px 24px',
                display: 'flex', alignItems: 'center',
                gap: '20px', flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center', flexShrink: 0, width: '44px' }}>
                  <span style={{ fontSize: '28px' }}>{level.badge}</span>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontWeight: 900, fontSize: '16px', color: level.color, marginBottom: '4px' }}>
                    {level.name}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>{level.req}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {level.perks.map(perk => (
                    <span key={perk} style={{
                      background: `${level.color}12`,
                      border: `1px solid ${level.color}25`,
                      color: level.color, fontSize: '11px',
                      fontWeight: 700, padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '80px 16px', background: '#060f1e' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
              How Onboarding Works
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '15px' }}>
              6 steps to becoming a verified GlobalHub Provider
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px'
          }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{
                background: '#0a1628', border: '1px solid #1a2740',
                borderRadius: '14px', padding: '22px',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  color: '#1a2740', fontWeight: 900, fontSize: '40px',
                  fontFamily: 'monospace', lineHeight: 1
                }}>
                  {step.n}
                </div>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '14px' }}>
                  {step.icon}
                </span>
                <h3 style={{ fontWeight: 900, fontSize: '15px', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Escrow Flow ── */}
      <section style={{
        padding: '80px 16px',
        background: 'rgba(34,197,94,0.03)',
        borderTop: '1px solid rgba(34,197,94,0.1)',
        borderBottom: '1px solid rgba(34,197,94,0.1)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <Lock size={26} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            100% Escrow Protection
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '580px', margin: '0 auto 40px' }}>
            Every customer payment is held securely by GlobalHub until you confirm delivery.
            You will never lose a legitimate earning.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0', flexWrap: 'wrap'
          }}>
            {[
              { label: 'Customer Pays', icon: '💳', color: '#60a5fa' },
              { label: 'GlobalHub Holds', icon: '🔒', color: '#fbbf24' },
              { label: 'You Deliver', icon: '📦', color: '#a78bfa' },
              { label: 'Verified', icon: '✅', color: '#34d399' },
              { label: 'You Get Paid', icon: '💰', color: '#22c55e' },
            ].map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  background: `${step.color}12`,
                  border: `1px solid ${step.color}25`,
                  borderRadius: '12px', padding: '14px 16px',
                  textAlign: 'center', minWidth: '100px'
                }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>
                    {step.icon}
                  </span>
                  <p style={{ color: step.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {step.label}
                  </p>
                </div>
                {i < 4 && (
                  <ChevronRight size={16} color="#374151"
                    style={{ margin: '0 4px', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '10px' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map(faq => (
              <div key={faq.q} style={{
                background: '#0a1628', border: '1px solid #1a2740',
                borderRadius: '12px', padding: '20px'
              }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', color: 'white' }}>
                  {faq.q}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 16px',
        background: 'linear-gradient(135deg, #0a1f12 0%, #060f1e 100%)',
        borderTop: '1px solid rgba(34,197,94,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Ready to Start Earning?
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px' }}>
            Join thousands of providers already earning on GlobalHub.
            Applications reviewed within 24-48 hours.
          </p>
          <Link href="/onboarding" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'black', padding: '18px 44px', borderRadius: '14px',
            fontWeight: 900, fontSize: '17px', textDecoration: 'none',
            boxShadow: '0 10px 35px rgba(34,197,94,0.3)'
          }}>
            Apply to Become a Provider
            <ArrowRight size={20} />
          </Link>
          <p style={{ color: '#374151', fontSize: '12px', marginTop: '14px' }}>
            Free to apply · No upfront costs · 15% fee on completed sales only
          </p>
        </div>
      </section>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #1a2740',
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#374151', fontSize: '12px' }}>
          © 2026 GlobalHub · All rights reserved ·{' '}
          <Link href="/terms" style={{ color: '#374151', textDecoration: 'none' }}>Terms</Link>
          {' · '}
          <Link href="/privacy" style={{ color: '#374151', textDecoration: 'none' }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
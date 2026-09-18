// app/page.tsx
"use client";

import { useState, useEffect, type ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap, Ticket, Globe,
  Check, ArrowRight, Shield, Clock,
} from 'lucide-react';
import Hero from './components/landing/Hero';
import Section from './components/landing/Section';
import Reveal from './components/landing/Reveal';
import './landing.css';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function LandingPage(): ReactElement {
  const [lang, setLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gh_lang');
      if (saved && LANGUAGES.some(l => l.code === saved)) {
        setLang(saved);
      } else {
        const nav = navigator.language.slice(0, 2);
        if (LANGUAGES.some(l => l.code === nav)) setLang(nav);
      }
    } catch { /* ignore */ }
  }, []);

  const pickLang = (code: string) => {
    setLang(code);
    setLangOpen(false);
    try { localStorage.setItem('gh_lang', code); } catch { /* ignore */ }
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ─── Floating language selector ─── */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 300 }}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setLangOpen(v => !v)}
            className="landing-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 10,
              padding: '8px 12px',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Globe size={13} />
            {currentLang.flag} {currentLang.label}
          </button>

          {langOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                marginTop: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 12,
                overflow: 'hidden',
                zIndex: 310,
                minWidth: 180,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => pickLang(l.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    background: lang === l.code ? 'var(--brand-dim)' : 'transparent',
                    border: 'none',
                    color: lang === l.code ? 'var(--brand)' : 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 1. HERO ─── */}
      <Hero />

      {/* ─── 2. VALUE PROP ─── */}
      <Section
        eyebrow="Built for winners worldwide"
        title="Serious signals. Instant payouts. Global reach."
        subtitle="GlobalHub is where expert sports analysis meets modern fintech. Pick a signal, pay once, watch it win — and withdraw your earnings within minutes."
        align="center"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginTop: 8,
          }}
        >
          {[
            { icon: Shield, title: 'Verified signals', text: 'Every signal is analyzed by professionals before publishing.' },
            { icon: Clock, title: 'Fast payouts', text: 'Withdraw via M-Pesa, bank, or PayPal within 30 minutes.' },
            { icon: Globe, title: 'Worldwide access', text: 'Available in 100+ countries with local payment methods.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 100}>
                <div
                  className="landing-card-hover"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 24,
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: 'var(--brand-dim)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={20} color="var(--brand)" />
                  </div>
                  <h3 className="landing-h3" style={{ color: 'var(--text)', marginBottom: 8 }}>
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
                    {f.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ─── 3. FOOTBALL ─── */}
      <Section
        id="football"
        variant="elevated"
        eyebrow="Football Intelligence"
        title="Expert football signals, verified daily"
        subtitle="Access premium match analysis across major leagues. Each signal includes entry, exit, and stake guidance — backed by 94% historical accuracy."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                'Live matches from Premier League, La Liga, Serie A, and more',
                'Entry, exit, and stake guidance on every signal',
                'Updates pushed instantly when a signal goes live',
                'Refunded if the signal does not perform',
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    color: 'var(--text-body)',
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <Check size={18} color="var(--brand)" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
              <Link
                href="/football"
                className="landing-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--brand)',
                  color: '#000',
                  padding: '13px 22px',
                  borderRadius: 11,
                  fontWeight: 900,
                  fontSize: 14,
                  textDecoration: 'none',
                  width: 'fit-content',
                  marginTop: 8,
                }}
              >
                Browse Football Signals
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/landing/screenshots/football-signals.png"
                alt="Football signals dashboard"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  textAlign: 'center',
                  padding: 20,
                }}
              >
                Football Signals
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ─── 4. AVIATOR ─── */}
      <Section
        id="aviator"
        eyebrow="Aviator Experience"
        title="Play the crash, ride the multiplier"
        subtitle="Real-time Aviator game with instant cashout. Our signals help you decide when to take off and when to bail."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <Reveal>
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/landing/screenshots/aviator-game.png"
                alt="Aviator game live screen"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  textAlign: 'center',
                  padding: 20,
                }}
              >
                Aviator Game
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                'Provably fair crash algorithm',
                'Instant cashout with one tap',
                'Live multiplayer rounds',
                'Auto-cashout protects your winnings',
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    color: 'var(--text-body)',
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <Check size={18} color="#a78bfa" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
              <Link
                href="/aviator/game"
                className="landing-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd',
                  padding: '13px 22px',
                  borderRadius: 11,
                  fontWeight: 900,
                  fontSize: 14,
                  textDecoration: 'none',
                  width: 'fit-content',
                  marginTop: 8,
                }}
              >
                <Zap size={14} />
                Play Aviator
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ─── 5. EVENTS & TICKETS ─── */}
      <Section
        id="events"
        variant="elevated"
        align="center"
        eyebrow="Events & Tickets"
        title="Book tickets to live events"
        subtitle="Concerts, sports, and festivals — buy securely with global payment options."
      >
        <Reveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {[
              { icon: Ticket, title: 'Instant tickets', text: 'QR codes delivered to your phone.' },
              { icon: Shield, title: 'Secure payments', text: 'Paystack protects every transaction.' },
              { icon: Clock, title: 'Fast check-in', text: 'Scan-and-go entry at the gate.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 100}>
                  <div
                    className="landing-card-hover"
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 22,
                      height: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={20} color="var(--brand)" style={{ marginBottom: 12 }} />
                    <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                      {f.title}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
                      {f.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div style={{ marginTop: 32 }}>
            <Link
              href="/tickets"
              className="landing-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--brand)',
                color: '#000',
                padding: '13px 22px',
                borderRadius: 11,
                fontWeight: 900,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Browse Events
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ─── 6. WALLET & PAYMENTS ─── */}
      <Section
        id="wallet"
        eyebrow="Wallet & Payments"
        title="Pay with what you have. Get paid fast."
        subtitle="Paystack-powered wallet with global payment methods and 30-minute payouts."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                'Deposit via card, M-Pesa, or bank transfer',
                'Withdraw to M-Pesa, PayPal, or bank account',
                'Instant wallet updates — no waiting',
                'All amounts stored in USD — no conversion fees for you',
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    color: 'var(--text-body)',
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <Check size={18} color="var(--brand)" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
              <Link
                href="/account"
                className="landing-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--brand)',
                  color: '#000',
                  padding: '13px 22px',
                  borderRadius: 11,
                  fontWeight: 900,
                  fontSize: 14,
                  textDecoration: 'none',
                  width: 'fit-content',
                  marginTop: 8,
                }}
              >
                Open Wallet
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/landing/screenshots/wallet.png"
                alt="GlobalHub wallet dashboard"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  textAlign: 'center',
                  padding: 20,
                }}
              >
                Wallet Dashboard
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ─── 7. GLOBAL ─── */}
      <Section
        id="global"
        variant="elevated"
        align="center"
        eyebrow="Global"
        title="Available in 100+ countries"
        subtitle="Wherever you are, GlobalHub works. Multiple languages, local payment methods, and 24/7 support."
      >
        <Reveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 10,
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            {LANGUAGES.map(l => (
              <div
                key={l.code}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--text-body)',
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ─── 8. FINAL CTA ─── */}
      <Section align="center" maxWidth={800}>
        <Reveal>
          <div
            style={{
              background: 'var(--grad-surface)',
              border: '1px solid var(--brand-dim)',
              borderRadius: 24,
              padding: 'clamp(32px, 6vw, 64px)',
              textAlign: 'center',
            }}
          >
            <h2 className="landing-h2" style={{ color: 'var(--text)', marginBottom: 16 }}>
              Ready to win daily?
            </h2>
            <p
              className="landing-body"
              style={{
                color: 'var(--text-muted)',
                maxWidth: 480,
                margin: '0 auto 32px',
              }}
            >
              Create a free account in 30 seconds. No subscription, no hidden fees.
            </p>
            <Link
              href="/register"
              className="landing-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#000',
                padding: '15px 30px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
              }}
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* ─── 9. FOOTER ─── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: 'clamp(40px, 6vw, 64px) 20px clamp(24px, 4vw, 32px)',
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            marginBottom: 40,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--grad-brand)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontWeight: 900, fontSize: 13 }}>GH</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>
                GLOBAL<span style={{ color: 'var(--brand)' }}>HUB</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
              Expert football analysis and Aviator signals. Trusted by thousands of winners
              across 100+ countries.
            </p>
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Product
            </p>
            {[
              { label: 'Football Signals', href: '/football' },
              { label: 'Aviator Signals', href: '/aviator' },
              { label: 'Play Aviator', href: '/aviator/game' },
              { label: 'Marketplace', href: '/marketplace' },
              { label: 'Tickets', href: '/tickets' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  textDecoration: 'none',
                  marginBottom: 10,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Company
            </p>
            {[
              { label: 'Become a Provider', href: '/become-provider' },
              { label: 'Support', href: '/support' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Pricing', href: '/pricing' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  textDecoration: 'none',
                  marginBottom: 10,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Legal
            </p>
            {[
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Responsible Gaming', href: '/responsible-gaming' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  textDecoration: 'none',
                  marginBottom: 10,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-dim)',
            fontSize: 12,
          }}
        >
          <span>© {new Date().getFullYear()} GlobalHub. All rights reserved.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Globe size={12} /> 100+ countries · 10 languages
          </span>
        </div>
      </footer>
    </div>
  );
}
// app/page.tsx
"use client";

import { useState, type ReactElement } from 'react';
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
import { useLanguage, LOCALES } from '@/lib/i18n';

export default function LandingPage(): ReactElement {
  const { lang, setLang, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const pickLang = (code: any) => {
    setLang(code);
    setLangOpen(false);
  };

  const currentLang = LOCALES.find(l => l.code === lang) || LOCALES[0];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* Floating language selector */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 300 }}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setLangOpen(v => !v)}
            className="landing-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              borderRadius: 10, padding: '8px 12px', color: 'var(--text)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Globe size={13} />
            {currentLang.flag} {currentLang.label}
          </button>

          {langOpen && (
            <div
              style={{
                position: 'absolute', top: '110%', right: 0, marginTop: 6,
                background: 'var(--surface)', border: '1px solid var(--border-strong)',
                borderRadius: 12, overflow: 'hidden', zIndex: 310, minWidth: 180,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => pickLang(l.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px',
                    background: lang === l.code ? 'var(--brand-dim)' : 'transparent',
                    border: 'none',
                    color: lang === l.code ? 'var(--brand)' : 'var(--text)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
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

      {/* 1. HERO */}
      <Hero />

      {/* 2. VALUE PROP */}
      <Section
        eyebrow={t('value.eyebrow')}
        title={t('value.title')}
        subtitle={t('value.subtitle')}
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
            { icon: Shield, title: t('value.f1.title'), text: t('value.f1.text') },
            { icon: Clock, title: t('value.f2.title'), text: t('value.f2.text') },
            { icon: Globe, title: t('value.f3.title'), text: t('value.f3.text') },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 100}>
                <div
                  className="landing-card-hover"
                  style={{
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: 24, height: '100%',
                  }}
                >
                  <div
                    style={{
                      width: 42, height: 42, background: 'var(--brand-dim)',
                      borderRadius: 12, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
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

      {/* 3. FOOTBALL */}
      <Section
        id="football"
        variant="elevated"
        eyebrow={t('football.eyebrow')}
        title={t('football.title')}
        subtitle={t('football.subtitle')}
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
                t('football.b1'),
                t('football.b2'),
                t('football.b3'),
                t('football.b4'),
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    color: 'var(--text-body)', fontSize: 15, lineHeight: 1.6,
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
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--brand)', color: '#000',
                  padding: '13px 22px', borderRadius: 11,
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                  width: 'fit-content', marginTop: 8,
                }}
              >
                {t('football.cta')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              style={{
                position: 'relative', aspectRatio: '4 / 3',
                borderRadius: 20, overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  position: 'relative', zIndex: 1,
                  color: 'var(--text-dim)', fontSize: 13,
                  textAlign: 'center', padding: 20,
                }}
              >
                {t('football.imageCaption')}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 4. AVIATOR */}
      <Section
        id="aviator"
        eyebrow={t('aviator.eyebrow')}
        title={t('aviator.title')}
        subtitle={t('aviator.subtitle')}
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
                position: 'relative', aspectRatio: '4 / 3',
                borderRadius: 20, overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  position: 'relative', zIndex: 1,
                  color: 'var(--text-dim)', fontSize: 13,
                  textAlign: 'center', padding: 20,
                }}
              >
                {t('aviator.imageCaption')}
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                t('aviator.b1'),
                t('aviator.b2'),
                t('aviator.b3'),
                t('aviator.b4'),
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    color: 'var(--text-body)', fontSize: 15, lineHeight: 1.6,
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
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd', padding: '13px 22px',
                  borderRadius: 11, fontWeight: 900, fontSize: 14,
                  textDecoration: 'none', width: 'fit-content', marginTop: 8,
                }}
              >
                <Zap size={14} />
                {t('aviator.cta')}
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 5. EVENTS */}
      <Section
        id="events"
        variant="elevated"
        align="center"
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        subtitle={t('events.subtitle')}
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
              { icon: Ticket, title: t('events.f1.title'), text: t('events.f1.text') },
              { icon: Shield, title: t('events.f2.title'), text: t('events.f2.text') },
              { icon: Clock, title: t('events.f3.title'), text: t('events.f3.text') },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 100}>
                  <div
                    className="landing-card-hover"
                    style={{
                      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: 22, height: '100%', textAlign: 'left',
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
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--brand)', color: '#000',
                padding: '13px 22px', borderRadius: 11,
                fontWeight: 900, fontSize: 14, textDecoration: 'none',
              }}
            >
              {t('events.cta')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* 6. WALLET */}
      <Section
        id="wallet"
        eyebrow={t('wallet.eyebrow')}
        title={t('wallet.title')}
        subtitle={t('wallet.subtitle')}
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
                t('wallet.b1'),
                t('wallet.b2'),
                t('wallet.b3'),
                t('wallet.b4'),
              ].map(item => (
                <div
                  key={item}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    color: 'var(--text-body)', fontSize: 15, lineHeight: 1.6,
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
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--brand)', color: '#000',
                  padding: '13px 22px', borderRadius: 11,
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                  width: 'fit-content', marginTop: 8,
                }}
              >
                {t('wallet.cta')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              style={{
                position: 'relative', aspectRatio: '4 / 3',
                borderRadius: 20, overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--grad-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                  position: 'relative', zIndex: 1,
                  color: 'var(--text-dim)', fontSize: 13,
                  textAlign: 'center', padding: 20,
                }}
              >
                {t('wallet.imageCaption')}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 7. GLOBAL */}
      <Section
        id="global"
        variant="elevated"
        align="center"
        eyebrow={t('global.eyebrow')}
        title={t('global.title')}
        subtitle={t('global.subtitle')}
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
            {LOCALES.map(l => (
              <div
                key={l.code}
                style={{
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: 'var(--text-body)',
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* 8. FINAL CTA */}
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
              {t('cta.title')}
            </h2>
            <p
              className="landing-body"
              style={{
                color: 'var(--text-muted)',
                maxWidth: 480,
                margin: '0 auto 32px',
              }}
            >
              {t('cta.subtitle')}
            </p>
            <Link
              href="/register"
              className="landing-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#000', padding: '15px 30px',
                borderRadius: 12, fontWeight: 900, fontSize: 16,
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
              }}
            >
              {t('cta.button')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* 9. FOOTER */}
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
                  width: 32, height: 32, background: 'var(--grad-brand)',
                  borderRadius: 8, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontWeight: 900, fontSize: 13 }}>GH</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>
                GLOBAL<span style={{ color: 'var(--brand)' }}>HUB</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('footer.product')}
            </p>
            {[
              { label: t('nav.football'), href: '/football' },
              { label: t('nav.aviator'), href: '/aviator' },
              { label: t('nav.playAviator'), href: '/aviator/game' },
              { label: t('nav.marketplace'), href: '/marketplace' },
              { label: t('nav.terms'), href: '/tickets' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block', color: 'var(--text-muted)',
                  fontSize: 13, textDecoration: 'none', marginBottom: 10,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('footer.company')}
            </p>
            {[
              { label: t('nav.becomeProvider'), href: '/become-provider' },
              { label: t('nav.support'), href: '/support' },
              { label: t('nav.faq'), href: '/faq' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block', color: 'var(--text-muted)',
                  fontSize: 13, textDecoration: 'none', marginBottom: 10,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('footer.legal')}
            </p>
            {[
              { label: t('nav.terms'), href: '/terms' },
              { label: t('nav.privacy'), href: '/privacy' },
              { label: t('nav.responsibleGaming'), href: '/responsible-gaming' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'block', color: 'var(--text-muted)',
                  fontSize: 13, textDecoration: 'none', marginBottom: 10,
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
          <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Globe size={12} /> {t('footer.countries')}
          </span>
        </div>
      </footer>
    </div>
  );
}
// app/components/landing/Hero.tsx
"use client";

import { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Particle {
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

export default function Hero(): ReactElement {
  const { t } = useLanguage();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [videoOk, setVideoOk] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  // Generate particles client-side only (avoid hydration mismatch)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const list: Particle[] = Array.from({ length: 24 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${12 + Math.random() * 18}s`,
      size: `${2 + Math.random() * 3}px`,
      opacity: 0.3 + Math.random() * 0.5,
    }));
    setParticles(list);
  }, []);

  // Check auth state (client) to switch CTA label
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        setLoggedIn(!!user);
      } catch {
        setLoggedIn(false);
      }
    })();
  }, []);

  // Detect if hero video is available (graceful fallback)
  useEffect(() => {
    const probe = document.createElement('video');
    probe.src = '/landing/hero/hero-loop.mp4';
    probe.oncanplaythrough = () => setVideoOk(true);
    probe.onerror = () => setVideoOk(false);
    probe.load();
  }, []);

  const primaryHref = loggedIn ? '/account' : '/register';
  const primaryLabel = loggedIn ? t('hero.cta.dashboard') : t('hero.cta.getStarted');

  return (
    <section
      style={{
        position: 'relative',
        minHeight: 'min(92vh, 820px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'clamp(80px, 12vh, 140px) 20px clamp(60px, 10vh, 100px)',
        background: 'radial-gradient(ellipse at top, #0A0F1A 0%, #05070C 70%)',
      }}
    >
      {/* Background video (if available) */}
      {videoOk && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/landing/hero/hero-poster.jpg"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.28,
            pointerEvents: 'none',
          }}
        >
          <source src="/landing/hero/hero-loop.mp4" type="video/mp4" />
        </video>
      )}

      {/* Gradient overlays */}
      <div className="landing-hero-glow" aria-hidden />
      <div className="landing-hero-grid" aria-hidden />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="landing-particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 820,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999,
            padding: '6px 14px',
            marginBottom: 28,
          }}
        >
          <span style={{
            width: 6, height: 6, background: '#22c55e', borderRadius: '50%',
            boxShadow: '0 0 8px #22c55e',
          }} />
          <span style={{ color: '#86efac', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            {t('hero.badge')}
          </span>
        </div>

        {/* Headline */}
        <h1 className="landing-h1" style={{ color: 'white', marginBottom: 20 }}>
          {t('hero.titlePrefix')}{' '}
          <span style={{
            background: 'linear-gradient(135deg,#22c55e 0%,#86efac 50%,#22c55e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {t('hero.titleAccent')}
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="landing-body"
          style={{
            color: '#94a3b8',
            maxWidth: 560,
            margin: '0 auto 40px',
          }}
        >
          {t('hero.subtitle')}
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 40,
          }}
        >
          <Link
            href={primaryHref}
            className="landing-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: '#000',
              padding: '14px 26px',
              borderRadius: 12,
              fontWeight: 900,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(34,197,94,0.35)',
            }}
          >
            {primaryLabel}
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/marketplace"
            className="landing-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              padding: '14px 26px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            {t('hero.cta.browse')}
          </Link>
        </div>

        {/* Trust row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 13,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Globe size={14} color="#22c55e" />
            {t('hero.trust.countries')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#22c55e" />
            {t('hero.trust.payouts')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#22c55e" />
            {t('hero.trust.secured')}
          </span>
        </div>
      </div>
    </section>
  );
}
// app/components/landing/Section.tsx
"use client";

import { type ReactElement, type ReactNode } from 'react';
import Reveal from './Reveal';

interface Props {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** 'left' (default) | 'center' */
  align?: 'left' | 'center';
  /** Optional background tint. */
  variant?: 'default' | 'elevated';
  /** Max content width. */
  maxWidth?: number;
}

export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  align = 'left',
  variant = 'default',
  maxWidth = 1100,
}: Props): ReactElement {
  const isCenter = align === 'center';

  return (
    <section
      id={id}
      style={{
        position: 'relative',
        padding: 'clamp(56px, 8vw, 120px) 20px',
        background: variant === 'elevated' ? '#0A0E15' : 'transparent',
        borderTop: variant === 'elevated' ? '1px solid rgba(255,255,255,0.04)' : 'none',
        borderBottom: variant === 'elevated' ? '1px solid rgba(255,255,255,0.04)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          textAlign: isCenter ? 'center' : 'left',
        }}
      >
        {(eyebrow || title || subtitle) && (
          <Reveal>
            <header
              style={{
                marginBottom: 'clamp(28px, 4vw, 56px)',
                maxWidth: isCenter ? 720 : 640,
                marginLeft: isCenter ? 'auto' : 0,
                marginRight: isCenter ? 'auto' : 0,
              }}
            >
              {eyebrow && (
                <p
                  style={{
                    color: '#22c55e',
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    marginBottom: 12,
                  }}
                >
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="landing-h2" style={{ color: 'white', marginBottom: subtitle ? 16 : 0 }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className="landing-body"
                  style={{ color: '#94a3b8', maxWidth: 560, margin: isCenter ? '0 auto' : 0 }}
                >
                  {subtitle}
                </p>
              )}
            </header>
          </Reveal>
        )}

        {children}
      </div>
    </section>
  );
}
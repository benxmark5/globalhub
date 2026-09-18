// lib/design.ts
// GlobalHub Design System — Tokens
// All values in one place. Import from anywhere.

export const tokens = {
  // ── Colors ──
  colors: {
    // Backgrounds
    bg: '#080B11',
    bgSubtle: '#0A0E15',
    surface: '#0E1420',
    surfaceElevated: '#131A28',
    surfaceHover: '#182031',

    // Borders
    border: '#1E2838',
    borderStrong: '#2A3548',
    borderSubtle: 'rgba(255,255,255,0.04)',

    // Text
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    textInverse: '#0A1628',

    // Brand
    brand: '#22c55e',
    brandHover: '#16a34a',
    brandDim: 'rgba(34,197,94,0.12)',
    brandRing: 'rgba(34,197,94,0.35)',

    // Semantic
    success: '#22c55e',
    successDim: 'rgba(34,197,94,0.12)',
    warning: '#f59e0b',
    warningDim: 'rgba(245,158,11,0.12)',
    danger: '#ef4444',
    dangerDim: 'rgba(239,68,68,0.12)',
    info: '#3b82f6',
    infoDim: 'rgba(59,130,246,0.12)',

    // Gradients
    gradBrand: 'linear-gradient(135deg,#22c55e,#16a34a)',
    gradSurface: 'linear-gradient(135deg,#0a1f12 0%,#0f1f33 100%)',
  },

  // ── Spacing (px) ──
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },

  // ── Radius ──
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  // ── Typography ──
  font: {
    xs: '11px',
    sm: '13px',
    md: '14px',
    base: '15px',
    lg: '18px',
    xl: '22px',
    '2xl': '28px',
    '3xl': '36px',
    '4xl': '44px',

    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    family: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
    },
  },

  // ── Shadows ──
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 8px 24px rgba(0,0,0,0.4)',
    xl: '0 20px 60px rgba(0,0,0,0.5)',
    brand: '0 8px 25px rgba(34,197,94,0.35)',
  },

  // ── Transitions ──
  transition: {
    fast: '0.15s ease',
    base: '0.2s ease',
    slow: '0.3s ease',
    smooth: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Shorthand exports for convenience
export const c = tokens.colors;
export const s = tokens.space;
export const r = tokens.radius;
export const f = tokens.font;
export const sh = tokens.shadow;
export const t = tokens.transition;
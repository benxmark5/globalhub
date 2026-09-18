// app/components/ThemeToggle.tsx
"use client";

import { useState, useEffect, type ReactElement } from 'react';
import { Sun, Moon } from 'lucide-react';
import { c, s, r, f, t } from '@/lib/design';

type Theme = 'dark' | 'light';

export default function ThemeToggle(): ReactElement {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const current = document.documentElement.getAttribute('data-theme') as Theme | null;
      if (current === 'dark' || current === 'light') {
        setTheme(current);
        return;
      }
      const saved = localStorage.getItem('gh_theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch { /* ignore */ }
  }, []);

  const flip = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('gh_theme', next); } catch { /* ignore */ }
  };

  // Avoid hydration mismatch — show a placeholder first
  if (!mounted) {
    return (
      <div
        aria-hidden
        style={{
          height: 36,
          borderRadius: r.sm,
          background: 'transparent',
        }}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s[2],
        padding: `8px ${s[3]}px`,
        background: 'transparent',
        border: `1px solid ${c.border}`,
        borderRadius: r.sm,
        cursor: 'pointer',
        width: '100%',
        color: c.textMuted,
        transition: `all ${t.fast}`,
        fontSize: f.xs,
        fontWeight: 600,
      }}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
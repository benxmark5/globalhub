// app/components/landing/Reveal.tsx
"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Delay in ms before the reveal starts. */
  delay?: number;
  /** Optional className to merge. */
  className?: string;
}

export default function Reveal({ children, delay = 0, className = '' }: Props): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVisible(true); return; }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`landing-reveal ${visible ? 'landing-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
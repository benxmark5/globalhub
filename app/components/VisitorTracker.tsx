"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function generateVisitorId(): string {
  const stored = localStorage.getItem('gh_visitor_id');
  if (stored) return stored;
  const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem('gh_visitor_id', id);
  return id;
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const locationRef = useRef<{
    country: string; city: string;
    currency: string; flag: string;
  } | null>(null);

  // Detect location once on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const cached = sessionStorage.getItem('gh_location');
        if (cached) {
          locationRef.current = JSON.parse(cached);
          return;
        }
        const res = await fetch('/api/detect-location');
        if (res.ok) {
          const data = await res.json();
          const loc = {
            country: data.countryName || data.country || 'Unknown',
            city: data.city || 'Unknown',
            currency: data.currency || 'USD',
            flag: data.flag || '🌍',
          };
          locationRef.current = loc;
          sessionStorage.setItem('gh_location', JSON.stringify(loc));

          // Also store currency for checkout to use
          localStorage.setItem('gh_currency', JSON.stringify({
            currency: data.currency,
            symbol: data.symbol,
            rate: data.rate,
            name: data.name,
            flag: data.flag,
            country: data.countryName,
          }));
        }
      } catch {
        // silent fail
      }
    };
    detectLocation();
  }, []);

  // Track each page navigation
  useEffect(() => {
    const track = async () => {
      try {
        const visitor_id = generateVisitorId();
        const loc = locationRef.current;
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id,
            page: pathname,
            referrer: document.referrer || 'direct',
            country: loc?.country || 'Unknown',
            city: loc?.city || 'Unknown',
            currency: loc?.currency || 'USD',
            flag: loc?.flag || '🌍',
          }),
        });
      } catch {
        // silent fail
      }
    };

    // Small delay to not block page load
    const timer = setTimeout(track, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // invisible component
}
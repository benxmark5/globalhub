// lib/useCurrency.ts
"use client";
import { useState, useEffect } from 'react';
import { CURRENCY_MAP, CurrencyInfo, isKenyaUser } from './currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCY_MAP.USD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If user has a saved override, use it
    try {
      const saved = localStorage.getItem('user_currency');
      if (saved && CURRENCY_MAP[saved]) {
        setCurrencyState(CURRENCY_MAP[saved]);
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }

    // 2. Otherwise auto-detect Kenya
    if (isKenyaUser()) {
      setCurrencyState(CURRENCY_MAP.KES);
      try { localStorage.setItem('user_country', 'KE'); } catch { /* ignore */ }
    }

    setLoading(false);
  }, []);

  const setCurrency = (newCurr: string | CurrencyInfo) => {
    const info = typeof newCurr === 'string'
      ? (CURRENCY_MAP[newCurr] || CURRENCY_MAP.USD)
      : newCurr;

    setCurrencyState(info);

    try {
      localStorage.setItem('user_currency', info.code);
      if (info.countryCode) {
        localStorage.setItem('user_country', info.countryCode);
      }
    } catch { /* ignore */ }
  };

  return { currency, setCurrency, loading, setLoading };
}
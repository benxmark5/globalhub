// app/lib/useCurrency.ts
"use client";
import { useState, useEffect } from 'react';
import {
  CurrencyInfo, DEFAULT_CURRENCY,
  loadCachedCurrency, saveCurrencyCache
} from './currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const load = async () => {
      // 1. Check localStorage first
      const cached = loadCachedCurrency();
      if (cached) {
        setCurrencyState(cached);
        setLoading(false);
        setDetected(true);
        return;
      }

      // 2. Fetch from IP detection API
      try {
        const res = await fetch('/api/detect-location');
        if (res.ok) {
          const data = await res.json();
          if (data.code || data.currency) {
            const curr: CurrencyInfo = {
              code: data.code || data.currency || 'USD',
              symbol: data.symbol || '$',
              rate: data.rate || 1,
              name: data.name || 'US Dollar',
              flag: data.flag || '🌍',
              country: data.countryName || data.country || 'Unknown',
              countryCode: data.countryCode || data.country || 'US',
            };
            setCurrencyState(curr);
            saveCurrencyCache(curr);
            setDetected(true);
          }
        }
      } catch { /* keep default */ }

      setLoading(false);
    };

    load();
  }, []);

  const setCurrency = (curr: CurrencyInfo) => {
    setCurrencyState(curr);
    saveCurrencyCache(curr);
  };

  return { currency, setCurrency, loading, detected };
}
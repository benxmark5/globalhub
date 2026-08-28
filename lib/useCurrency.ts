"use client";
import { useState } from 'react';
import { CURRENCY_MAP, CurrencyInfo } from './currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCY_MAP.USD);
  const [loading, setLoading] = useState(false);

  const setCurrency = (newCurr: string | CurrencyInfo) => {
    if (typeof newCurr === 'string') {
      setCurrencyState(CURRENCY_MAP[newCurr] || CURRENCY_MAP.USD);
    } else {
      setCurrencyState(newCurr);
    }
  };

  return { currency, setCurrency, loading, setLoading };
}

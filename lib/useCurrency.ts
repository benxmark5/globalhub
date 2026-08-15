"use client";
import { useState } from 'react';

export function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  return { currency, setCurrency };
}

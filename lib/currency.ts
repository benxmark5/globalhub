// lib/currency.ts
export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
  name: string;
  country: string;
  flag: string;
  countryCode: string;
}

// Rates here are DISPLAY-ONLY conversions from USD.
// All wallet values are stored in USD.
export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$',    rate: 1,     name: 'US Dollar',        country: 'United States',  flag: '🇺🇸', countryCode: 'US' },
  KES: { code: 'KES', symbol: 'KSh ', rate: 129.5, name: 'Kenyan Shilling',  country: 'Kenya',          flag: '🇰🇪', countryCode: 'KE' },
  EUR: { code: 'EUR', symbol: '€',    rate: 0.92,  name: 'Euro',             country: 'European Union', flag: '🇪🇺', countryCode: 'EU' },
  GBP: { code: 'GBP', symbol: '£',    rate: 0.79,  name: 'British Pound',    country: 'United Kingdom', flag: '🇬🇧', countryCode: 'GB' },
};

// Detect if user is in Kenya based on saved preference or browser locale
export function isKenyaUser(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check saved user preference first
  try {
    const saved = localStorage.getItem('user_country');
    if (saved) return saved.toUpperCase() === 'KE';
  } catch { /* ignore */ }

  // 2. Check browser locale
  try {
    const locales = [navigator.language, ...(navigator.languages || [])];
    return locales.some(l => l && (l.toLowerCase() === 'sw' || l.toLowerCase() === 'sw-ke' || l.toLowerCase().endsWith('-ke')));
  } catch { /* ignore */ }

  return false;
}

export function toLocalAmount(amount: number, currency: string | { code: string } = 'USD'): number {
  const key = typeof currency === 'string' ? currency : currency.code;
  const curr = CURRENCY_MAP[key] || CURRENCY_MAP.USD;
  return Number((amount * curr.rate).toFixed(2));
}

export function formatAmount(amount: number, currency: string | { code: string; symbol?: string } = 'USD'): string {
  const key = typeof currency === 'string' ? currency : currency.code;
  const curr = CURRENCY_MAP[key] || CURRENCY_MAP.USD;
  const symbol = typeof currency === 'string' ? curr.symbol : (currency.symbol || curr.symbol);
  return `${symbol}${amount.toFixed(2)}`;
}
export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
  name: string;
  country: string;
  flag: string;
  countryCode: string;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar', country: 'United States', flag: '🇺🇸', countryCode: 'US' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', country: 'European Union', flag: '🇪🇺', countryCode: 'EU' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', countryCode: 'GB' },
};

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

export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
};

export function toLocalAmount(amount: number, currency = 'USD'): number {
  const curr = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;
  return Number((amount * curr.rate).toFixed(2));
}

export function formatAmount(amount: number, currency = 'USD'): string {
  const curr = CURRENCY_MAP[currency] || CURRENCY_MAP.USD;
  return ${curr.symbol};
}

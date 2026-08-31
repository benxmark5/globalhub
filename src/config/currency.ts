export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToUSD: number;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1.0, name: 'US Dollar' },
  KES: { code: 'KES', symbol: 'KSh', rateToUSD: 129.5, name: 'Kenyan Shilling' },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79, name: 'British Pound' },
  NGN: { code: 'NGN', symbol: '?', rateToUSD: 1450.0, name: 'Nigerian Naira' },
  ZAR: { code: 'ZAR', symbol: 'R', rateToUSD: 18.5, name: 'South African Rand' },
};

const DEFAULT_CURRENCY = 'USD';

export function formatCurrency(amountInUSD: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  const convertedAmount = amountInUSD * currency.rateToUSD;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount).replace(currency.code, currency.symbol);
}

export function convertToUSD(amountInLocal: number, currencyCode: string): number {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  return amountInLocal / currency.rateToUSD;
}

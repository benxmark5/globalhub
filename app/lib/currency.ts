// app/lib/currency.ts
// Single source of truth for all currency logic across the app

export type CurrencyInfo = {
  code: string;     // e.g. "KES"
  symbol: string;   // e.g. "KES" or "£"
  rate: number;     // multiplier from USD
  name: string;     // e.g. "Kenyan Shilling"
  flag: string;     // emoji flag
  country: string;  // e.g. "Kenya"
  countryCode: string; // e.g. "KE"
};

export const DEFAULT_CURRENCY: CurrencyInfo = {
  code: 'USD', symbol: '$', rate: 1,
  name: 'US Dollar', flag: '🌍',
  country: 'United States', countryCode: 'US',
};

// Full currency map — country code → currency info
export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // ── Africa ─────────────────────────────────
  KE: { code:'KES', symbol:'KES', rate:130,   name:'Kenyan Shilling',         flag:'🇰🇪', country:'Kenya',            countryCode:'KE' },
  NG: { code:'NGN', symbol:'₦',   rate:1600,  name:'Nigerian Naira',           flag:'🇳🇬', country:'Nigeria',          countryCode:'NG' },
  GH: { code:'GHS', symbol:'GH₵', rate:15,    name:'Ghanaian Cedi',            flag:'🇬🇭', country:'Ghana',            countryCode:'GH' },
  ZA: { code:'ZAR', symbol:'R',   rate:19,    name:'South African Rand',       flag:'🇿🇦', country:'South Africa',     countryCode:'ZA' },
  UG: { code:'UGX', symbol:'UGX', rate:3800,  name:'Ugandan Shilling',         flag:'🇺🇬', country:'Uganda',           countryCode:'UG' },
  TZ: { code:'TZS', symbol:'TZS', rate:2600,  name:'Tanzanian Shilling',       flag:'🇹🇿', country:'Tanzania',         countryCode:'TZ' },
  EG: { code:'EGP', symbol:'E£',  rate:49,    name:'Egyptian Pound',           flag:'🇪🇬', country:'Egypt',            countryCode:'EG' },
  MA: { code:'MAD', symbol:'MAD', rate:10,    name:'Moroccan Dirham',          flag:'🇲🇦', country:'Morocco',          countryCode:'MA' },
  ET: { code:'ETB', symbol:'ETB', rate:57,    name:'Ethiopian Birr',           flag:'🇪🇹', country:'Ethiopia',         countryCode:'ET' },
  BW: { code:'BWP', symbol:'P',   rate:13.5,  name:'Botswana Pula',            flag:'🇧🇼', country:'Botswana',         countryCode:'BW' },
  ZM: { code:'ZMW', symbol:'ZK',  rate:25,    name:'Zambian Kwacha',           flag:'🇿🇲', country:'Zambia',           countryCode:'ZM' },
  RW: { code:'RWF', symbol:'FRw', rate:1320,  name:'Rwandan Franc',            flag:'🇷🇼', country:'Rwanda',           countryCode:'RW' },
  ZW: { code:'USD', symbol:'$',   rate:1,     name:'US Dollar',                flag:'🇿🇼', country:'Zimbabwe',         countryCode:'ZW' },
  AO: { code:'AOA', symbol:'Kz',  rate:850,   name:'Angolan Kwanza',           flag:'🇦🇴', country:'Angola',           countryCode:'AO' },
  MZ: { code:'MZN', symbol:'MT',  rate:64,    name:'Mozambican Metical',       flag:'🇲🇿', country:'Mozambique',       countryCode:'MZ' },
  MU: { code:'MUR', symbol:'₨',   rate:46,    name:'Mauritian Rupee',          flag:'🇲🇺', country:'Mauritius',        countryCode:'MU' },
  SD: { code:'SDG', symbol:'SDG', rate:600,   name:'Sudanese Pound',           flag:'🇸🇩', country:'Sudan',            countryCode:'SD' },
  DZ: { code:'DZD', symbol:'DA',  rate:135,   name:'Algerian Dinar',           flag:'🇩🇿', country:'Algeria',          countryCode:'DZ' },
  TN: { code:'TND', symbol:'DT',  rate:3.1,   name:'Tunisian Dinar',           flag:'🇹🇳', country:'Tunisia',          countryCode:'TN' },
  LY: { code:'LYD', symbol:'LD',  rate:4.8,   name:'Libyan Dinar',             flag:'🇱🇾', country:'Libya',            countryCode:'LY' },
  SN: { code:'XOF', symbol:'CFA', rate:605,   name:'West African CFA Franc',   flag:'🇸🇳', country:'Senegal',          countryCode:'SN' },
  CI: { code:'XOF', symbol:'CFA', rate:605,   name:'West African CFA Franc',   flag:'🇨🇮', country:'Ivory Coast',      countryCode:'CI' },
  CM: { code:'XAF', symbol:'FCFA',rate:605,   name:'Central African CFA',      flag:'🇨🇲', country:'Cameroon',         countryCode:'CM' },
  // ── Americas ───────────────────────────────
  US: { code:'USD', symbol:'$',   rate:1,     name:'US Dollar',                flag:'🇺🇸', country:'United States',    countryCode:'US' },
  CA: { code:'CAD', symbol:'CA$', rate:1.37,  name:'Canadian Dollar',          flag:'🇨🇦', country:'Canada',           countryCode:'CA' },
  BR: { code:'BRL', symbol:'R$',  rate:5.1,   name:'Brazilian Real',           flag:'🇧🇷', country:'Brazil',           countryCode:'BR' },
  MX: { code:'MXN', symbol:'MX$', rate:17,    name:'Mexican Peso',             flag:'🇲🇽', country:'Mexico',           countryCode:'MX' },
  AR: { code:'ARS', symbol:'$',   rate:870,   name:'Argentine Peso',           flag:'🇦🇷', country:'Argentina',        countryCode:'AR' },
  CO: { code:'COP', symbol:'COL$',rate:3900,  name:'Colombian Peso',           flag:'🇨🇴', country:'Colombia',         countryCode:'CO' },
  PE: { code:'PEN', symbol:'S/',  rate:3.8,   name:'Peruvian Sol',             flag:'🇵🇪', country:'Peru',             countryCode:'PE' },
  CL: { code:'CLP', symbol:'CLP$',rate:950,   name:'Chilean Peso',             flag:'🇨🇱', country:'Chile',            countryCode:'CL' },
  JM: { code:'JMD', symbol:'J$',  rate:157,   name:'Jamaican Dollar',          flag:'🇯🇲', country:'Jamaica',          countryCode:'JM' },
  // ── Europe ─────────────────────────────────
  GB: { code:'GBP', symbol:'£',   rate:0.79,  name:'British Pound',            flag:'🇬🇧', country:'United Kingdom',   countryCode:'GB' },
  DE: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇩🇪', country:'Germany',          countryCode:'DE' },
  FR: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇫🇷', country:'France',           countryCode:'FR' },
  IT: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇮🇹', country:'Italy',            countryCode:'IT' },
  ES: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇪🇸', country:'Spain',            countryCode:'ES' },
  NL: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇳🇱', country:'Netherlands',      countryCode:'NL' },
  PT: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇵🇹', country:'Portugal',         countryCode:'PT' },
  BE: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇧🇪', country:'Belgium',          countryCode:'BE' },
  AT: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇦🇹', country:'Austria',          countryCode:'AT' },
  IE: { code:'EUR', symbol:'€',   rate:0.92,  name:'Euro',                     flag:'🇮🇪', country:'Ireland',          countryCode:'IE' },
  SE: { code:'SEK', symbol:'kr',  rate:10.5,  name:'Swedish Krona',            flag:'🇸🇪', country:'Sweden',           countryCode:'SE' },
  NO: { code:'NOK', symbol:'kr',  rate:10.8,  name:'Norwegian Krone',          flag:'🇳🇴', country:'Norway',           countryCode:'NO' },
  DK: { code:'DKK', symbol:'kr',  rate:6.9,   name:'Danish Krone',             flag:'🇩🇰', country:'Denmark',          countryCode:'DK' },
  CH: { code:'CHF', symbol:'Fr',  rate:0.90,  name:'Swiss Franc',              flag:'🇨🇭', country:'Switzerland',      countryCode:'CH' },
  PL: { code:'PLN', symbol:'zł',  rate:4.0,   name:'Polish Zloty',             flag:'🇵🇱', country:'Poland',           countryCode:'PL' },
  RU: { code:'RUB', symbol:'₽',   rate:90,    name:'Russian Ruble',            flag:'🇷🇺', country:'Russia',           countryCode:'RU' },
  TR: { code:'TRY', symbol:'₺',   rate:32,    name:'Turkish Lira',             flag:'🇹🇷', country:'Turkey',           countryCode:'TR' },
  UA: { code:'UAH', symbol:'₴',   rate:39,    name:'Ukrainian Hryvnia',        flag:'🇺🇦', country:'Ukraine',          countryCode:'UA' },
  CZ: { code:'CZK', symbol:'Kč',  rate:23,    name:'Czech Koruna',             flag:'🇨🇿', country:'Czech Republic',   countryCode:'CZ' },
  HU: { code:'HUF', symbol:'Ft',  rate:360,   name:'Hungarian Forint',         flag:'🇭🇺', country:'Hungary',          countryCode:'HU' },
  RO: { code:'RON', symbol:'lei', rate:4.6,   name:'Romanian Leu',             flag:'🇷🇴', country:'Romania',          countryCode:'RO' },
  // ── Asia ───────────────────────────────────
  IN: { code:'INR', symbol:'₹',   rate:83,    name:'Indian Rupee',             flag:'🇮🇳', country:'India',            countryCode:'IN' },
  CN: { code:'CNY', symbol:'¥',   rate:7.2,   name:'Chinese Yuan',             flag:'🇨🇳', country:'China',            countryCode:'CN' },
  JP: { code:'JPY', symbol:'¥',   rate:150,   name:'Japanese Yen',             flag:'🇯🇵', country:'Japan',            countryCode:'JP' },
  KR: { code:'KRW', symbol:'₩',   rate:1350,  name:'South Korean Won',         flag:'🇰🇷', country:'South Korea',      countryCode:'KR' },
  SG: { code:'SGD', symbol:'S$',  rate:1.35,  name:'Singapore Dollar',         flag:'🇸🇬', country:'Singapore',        countryCode:'SG' },
  HK: { code:'HKD', symbol:'HK$', rate:7.8,   name:'Hong Kong Dollar',         flag:'🇭🇰', country:'Hong Kong',        countryCode:'HK' },
  AE: { code:'AED', symbol:'AED', rate:3.67,  name:'UAE Dirham',               flag:'🇦🇪', country:'UAE',              countryCode:'AE' },
  SA: { code:'SAR', symbol:'SAR', rate:3.75,  name:'Saudi Riyal',              flag:'🇸🇦', country:'Saudi Arabia',     countryCode:'SA' },
  PK: { code:'PKR', symbol:'Rs',  rate:279,   name:'Pakistani Rupee',          flag:'🇵🇰', country:'Pakistan',         countryCode:'PK' },
  BD: { code:'BDT', symbol:'৳',   rate:110,   name:'Bangladeshi Taka',         flag:'🇧🇩', country:'Bangladesh',       countryCode:'BD' },
  ID: { code:'IDR', symbol:'Rp',  rate:15800, name:'Indonesian Rupiah',        flag:'🇮🇩', country:'Indonesia',        countryCode:'ID' },
  MY: { code:'MYR', symbol:'RM',  rate:4.7,   name:'Malaysian Ringgit',        flag:'🇲🇾', country:'Malaysia',         countryCode:'MY' },
  PH: { code:'PHP', symbol:'₱',   rate:56,    name:'Philippine Peso',          flag:'🇵🇭', country:'Philippines',      countryCode:'PH' },
  TH: { code:'THB', symbol:'฿',   rate:35,    name:'Thai Baht',                flag:'🇹🇭', country:'Thailand',         countryCode:'TH' },
  VN: { code:'VND', symbol:'₫',   rate:25000, name:'Vietnamese Dong',          flag:'🇻🇳', country:'Vietnam',          countryCode:'VN' },
  KW: { code:'KWD', symbol:'KD',  rate:0.31,  name:'Kuwaiti Dinar',            flag:'🇰🇼', country:'Kuwait',           countryCode:'KW' },
  QA: { code:'QAR', symbol:'QR',  rate:3.64,  name:'Qatari Riyal',             flag:'🇶🇦', country:'Qatar',            countryCode:'QA' },
  // ── Oceania ────────────────────────────────
  AU: { code:'AUD', symbol:'A$',  rate:1.53,  name:'Australian Dollar',        flag:'🇦🇺', country:'Australia',        countryCode:'AU' },
  NZ: { code:'NZD', symbol:'NZ$', rate:1.63,  name:'New Zealand Dollar',       flag:'🇳🇿', country:'New Zealand',      countryCode:'NZ' },
};

/** Convert USD amount to local currency */
export function toLocalAmount(usdPrice: number, curr: CurrencyInfo): number {
  return Math.ceil(usdPrice * curr.rate);
}

/** Format a local amount nicely */
export function formatAmount(amount: number, curr: CurrencyInfo): string {
  if (amount >= 1000000) return `${curr.symbol}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 10000) return `${curr.symbol}${amount.toLocaleString()}`;
  return `${curr.symbol}${amount.toLocaleString()}`;
}

/** Load currency from localStorage cache */
export function loadCachedCurrency(): CurrencyInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('gh_currency_v2');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.code || !data.rate) return null;
    return data as CurrencyInfo;
  } catch { return null; }
}

/** Save currency to localStorage */
export function saveCurrencyCache(curr: CurrencyInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gh_currency_v2', JSON.stringify(curr));
}
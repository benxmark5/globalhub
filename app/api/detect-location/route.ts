import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';

    const isLocal = !ip || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1';

    let country = 'US';
    let countryName = 'United States';
    let city = 'Unknown';

    if (!isLocal) {
      try {
        const res = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`,
          { next: { revalidate: 3600 } }
        );
        if (res.ok) {
          const geo = await res.json();
          if (geo.status === 'success') {
            country = geo.countryCode || 'US';
            countryName = geo.country || 'United States';
            city = geo.city || 'Unknown';
          }
        }
      } catch { /* silent */ }
    }

    const CURRENCIES: Record<string, { currency: string; symbol: string; rate: number; name: string; flag: string; }> = {
      KE: { currency:'KES', symbol:'KES', rate:130,  name:'Kenyan Shilling',        flag:'🇰🇪' },
      NG: { currency:'NGN', symbol:'₦',   rate:1600, name:'Nigerian Naira',          flag:'🇳🇬' },
      GH: { currency:'GHS', symbol:'GH₵', rate:15,   name:'Ghanaian Cedi',           flag:'🇬🇭' },
      ZA: { currency:'ZAR', symbol:'R',   rate:19,   name:'South African Rand',      flag:'🇿🇦' },
      UG: { currency:'UGX', symbol:'UGX', rate:3800, name:'Ugandan Shilling',        flag:'🇺🇬' },
      TZ: { currency:'TZS', symbol:'TZS', rate:2600, name:'Tanzanian Shilling',      flag:'🇹🇿' },
      EG: { currency:'EGP', symbol:'E£',   rate:49,   name:'Egyptian Pound',          flag:'🇪🇬' },
      MA: { currency:'MAD', symbol:'MAD', rate:10,   name:'Moroccan Dirham',         flag:'🇲🇦' },
      ET: { currency:'ETB', symbol:'ETB', rate:57,   name:'Ethiopian Birr',          flag:'🇪🇹' },
      BW: { currency:'BWP', symbol:'P',   rate:13.5, name:'Botswana Pula',           flag:'🇧🇼' },
      ZM: { currency:'ZMW', symbol:'ZK',   rate:25,   name:'Zambian Kwacha',          flag:'🇿🇲' },
      RW: { currency:'RWF', symbol:'FRw', rate:1320, name:'Rwandan Franc',           flag:'🇷🇼' },
      ZW: { currency:'USD', symbol:'$',   rate:1,    name:'US Dollar',               flag:'🇿🇼' },
      AO: { currency:'AOA', symbol:'Kz',   rate:850,  name:'Angolan Kwanza',          flag:'🇦🇴' },
      MZ: { currency:'MZN', symbol:'MT',   rate:64,   name:'Mozambican Metical',      flag:'🇲🇿' },
      MU: { currency:'MUR', symbol:'₨',   rate:46,   name:'Mauritian Rupee',         flag:'🇲🇺' },
      SD: { currency:'SDG', symbol:'SDG', rate:600,  name:'Sudanese Pound',          flag:'🇸🇩' },
      DZ: { currency:'DZD', symbol:'DA',   rate:135,  name:'Algerian Dinar',          flag:'🇩🇿' },
      TN: { currency:'TND', symbol:'DT',   rate:3.1,  name:'Tunisian Dinar',          flag:'🇹🇳' },
      SN: { currency:'XOF', symbol:'CFA', rate:605,  name:'West African CFA Franc',  flag:'🇸🇳' },
      CI: { currency:'XOF', symbol:'CFA', rate:605,  name:'West African CFA Franc',  flag:'🇨🇮' },
      CM: { currency:'XAF', symbol:'FCFA',rate:605,  name:'Central African CFA',     flag:'🇨🇲' },
      US: { currency:'USD', symbol:'$',   rate:1,    name:'US Dollar',               flag:'🇺🇸' },
      CA: { currency:'CAD', symbol:'CA$', rate:1.37, name:'Canadian Dollar',         flag:'🇨🇦' },
      BR: { currency:'BRL', symbol:'R$',   rate:5.1,  name:'Brazilian Real',          flag:'🇧🇷' },
      MX: { currency:'MXN', symbol:'MX$', rate:17,   name:'Mexican Peso',            flag:'🇲🇽' },
      AR: { currency:'ARS', symbol:'$',   rate:870,  name:'Argentine Peso',          flag:'🇦🇷' },
      CO: { currency:'COP', symbol:'COL$',rate:3900, name:'Colombian Peso',          flag:'🇨🇴' },
      JM: { currency:'JMD', symbol:'J$',   rate:157,  name:'Jamaican Dollar',         flag:'🇯🇲' },
      GB: { currency:'GBP', symbol:'£',   rate:0.79, name:'British Pound',           flag:'🇬🇧' },
      DE: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇩🇪' },
      FR: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇫🇷' },
      IT: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇮🇹' },
      ES: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇪🇸' },
      NL: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇳🇱' },
      PT: { currency:'EUR', symbol:'€',   rate:0.92, name:'Euro',                    flag:'🇵🇹' },
      PL: { currency:'PLN', symbol:'zł',   rate:4.0,  name:'Polish Zloty',            flag:'🇵🇱' },
      SE: { currency:'SEK', symbol:'kr',   rate:10.5, name:'Swedish Krona',           flag:'🇸🇪' },
      NO: { currency:'NOK', symbol:'kr',   rate:10.8, name:'Norwegian Krone',         flag:'🇳🇴' },
      CH: { currency:'CHF', symbol:'Fr',   rate:0.90, name:'Swiss Franc',             flag:'🇨🇭' },
      RU: { currency:'RUB', symbol:'₽',   rate:90,   name:'Russian Ruble',           flag:'🇷🇺' },
      TR: { currency:'TRY', symbol:'₺',   rate:32,   name:'Turkish Lira',            flag:'🇹🇷' },
      UA: { currency:'UAH', symbol:'₴',   rate:39,   name:'Ukrainian Hryvnia',       flag:'🇺🇦' },
      IN: { currency:'INR', symbol:'₹',   rate:83,   name:'Indian Rupee',            flag:'🇮🇳' },
      CN: { currency:'CNY', symbol:'¥',   rate:7.2,  name:'Chinese Yuan',            flag:'🇨🇳' },
      JP: { currency:'JPY', symbol:'¥',   rate:150,  name:'Japanese Yen',            flag:'🇯🇵' },
      KR: { currency:'KRW', symbol:'₩',   rate:1350, name:'South Korean Won',        flag:'🇰🇷' },
      SG: { currency:'SGD', symbol:'S$',   rate:1.35, name:'Singapore Dollar',        flag:'🇸🇬' },
      AE: { currency:'AED', symbol:'AED', rate:3.67, name:'UAE Dirham',              flag:'🇦🇪' },
      SA: { currency:'SAR', symbol:'SAR', rate:3.75, name:'Saudi Riyal',             flag:'🇸🇦' },
      PK: { currency:'PKR', symbol:'Rs',   rate:279,  name:'Pakistani Rupee',         flag:'🇵🇰' },
      BD: { currency:'BDT', symbol:'৳',   rate:110,  name:'Bangladeshi Taka',        flag:'🇧🇩' },
      ID: { currency:'IDR', symbol:'Rp',   rate:15800,name:'Indonesian Rupiah',        flag:'🇮🇩' },
      MY: { currency:'MYR', symbol:'RM',   rate:4.7,  name:'Malaysian Ringgit',       flag:'🇲🇾' },
      PH: { currency:'PHP', symbol:'₱',   rate:56,   name:'Philippine Peso',         flag:'🇵🇭' },
      TH: { currency:'THB', symbol:'฿',   rate:35,   name:'Thai Baht',               flag:'🇹🇭' },
      VN: { currency:'VND', symbol:'₫',   rate:25000,name:'Vietnamese Dong',         flag:'🇻🇳' },
      AU: { currency:'AUD', symbol:'A$',   rate:1.53, name:'Australian Dollar',        flag:'🇦🇺' },
      NZ: { currency:'NZD', symbol:'NZ$', rate:1.63, name:'New Zealand Dollar',      flag:'🇳🇿' },
    };

    const info = CURRENCIES[country] || { currency:'USD', symbol:'$', rate:1, name:'US Dollar', flag:'🌍' };

    return NextResponse.json({ country, countryName, city, ...info });
  } catch {
    return NextResponse.json({
      country:'US', countryName:'United States', city:'Unknown',
      currency:'USD', symbol:'$', rate:1, name:'US Dollar', flag:'🌍',
    });
  }
}
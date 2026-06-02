"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const footballPlans = [
  { games: 1, price: 1.20, label: '1 Game', bonus: 0 },
  { games: 2, price: 2.40, label: '2 Games', bonus: 0 },
  { games: 3, price: 4.00, label: '3 Games', bonus: 0 },
  { games: 5, price: 6.00, label: '5 Games', bonus: 0 },
  { games: 8, price: 9.00, label: '8 Games', bonus: 0 },
  { games: 10, price: 12.00, label: '10 Games', bonus: 0 },
  { games: 15, price: 18.00, label: '15 Games', bonus: 0 },
  { games: 20, price: 25.00, label: '20 Games', bonus: 0 },
  { games: 30, price: 35.00, label: '30 Games', bonus: 0 },
  { games: 50, price: 55.00, label: '50 Games', bonus: 2 },
  { games: 75, price: 75.00, label: '75 Games', bonus: 2 },
  { games: 100, price: 100.00, label: '100 Games', bonus: 2 },
];

const aviatorPlans = [
  { tier: 'SINGLE', signals: 1, price: 3 },
  { tier: 'NORMAL', signals: 4, price: 10 },
  { tier: 'VIP', signals: 8, price: 18 },
  { tier: 'VVIP', signals: 12, price: 25 },
];

const getCurrencyInfo = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const map: Record<string, {
      c: string; r: number; s: string; name: string
    }> = {
      // Africa
      'Africa/Nairobi': { c: 'KES', r: 130, s: 'KES', name: 'Kenyan Shilling' },
      'Africa/Lagos': { c: 'NGN', r: 1600, s: '₦', name: 'Nigerian Naira' },
      'Africa/Accra': { c: 'GHS', r: 15, s: 'GH₵', name: 'Ghanaian Cedi' },
      'Africa/Johannesburg': { c: 'ZAR', r: 19, s: 'R', name: 'South African Rand' },
      'Africa/Kampala': { c: 'UGX', r: 3800, s: 'UGX', name: 'Ugandan Shilling' },
      'Africa/Dar_es_Salaam': { c: 'TZS', r: 2600, s: 'TZS', name: 'Tanzanian Shilling' },
      'Africa/Cairo': { c: 'EGP', r: 49, s: 'E£', name: 'Egyptian Pound' },
      'Africa/Casablanca': { c: 'MAD', r: 10, s: 'MAD', name: 'Moroccan Dirham' },
      'Africa/Addis_Ababa': { c: 'ETB', r: 57, s: 'ETB', name: 'Ethiopian Birr' },
      'Africa/Abidjan': { c: 'XOF', r: 605, s: 'CFA', name: 'West African CFA Franc' },
      'Africa/Dakar': { c: 'XOF', r: 605, s: 'CFA', name: 'West African CFA Franc' },
      'Africa/Douala': { c: 'XAF', r: 605, s: 'FCFA', name: 'Central African CFA Franc' },
      'Africa/Khartoum': { c: 'SDG', r: 600, s: 'SDG', name: 'Sudanese Pound' },
      'Africa/Lusaka': { c: 'ZMW', r: 25, s: 'ZK', name: 'Zambian Kwacha' },
      'Africa/Harare': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'Africa/Maputo': { c: 'MZN', r: 64, s: 'MT', name: 'Mozambican Metical' },
      'Africa/Tunis': { c: 'TND', r: 3.1, s: 'DT', name: 'Tunisian Dinar' },
      'Africa/Tripoli': { c: 'LYD', r: 4.8, s: 'LD', name: 'Libyan Dinar' },
      'Africa/Algiers': { c: 'DZD', r: 135, s: 'DA', name: 'Algerian Dinar' },
      // Americas
      'America/New_York': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Chicago': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Denver': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Los_Angeles': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Phoenix': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Anchorage': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Toronto': { c: 'CAD', r: 1.37, s: 'CA$', name: 'Canadian Dollar' },
      'America/Vancouver': { c: 'CAD', r: 1.37, s: 'CA$', name: 'Canadian Dollar' },
      'America/Sao_Paulo': { c: 'BRL', r: 5.1, s: 'R$', name: 'Brazilian Real' },
      'America/Mexico_City': { c: 'MXN', r: 17, s: 'MX$', name: 'Mexican Peso' },
      'America/Argentina/Buenos_Aires': { c: 'ARS', r: 870, s: '$', name: 'Argentine Peso' },
      'America/Bogota': { c: 'COP', r: 3900, s: 'COL$', name: 'Colombian Peso' },
      'America/Lima': { c: 'PEN', r: 3.8, s: 'S/', name: 'Peruvian Sol' },
      'America/Santiago': { c: 'CLP', r: 950, s: 'CLP$', name: 'Chilean Peso' },
      'America/Caracas': { c: 'VES', r: 36, s: 'Bs.S', name: 'Venezuelan Bolívar' },
      'America/Guayaquil': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/La_Paz': { c: 'BOB', r: 6.9, s: 'Bs', name: 'Bolivian Boliviano' },
      'America/Asuncion': { c: 'PYG', r: 7400, s: '₲', name: 'Paraguayan Guaraní' },
      'America/Montevideo': { c: 'UYU', r: 39, s: '$U', name: 'Uruguayan Peso' },
      'America/Panama': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
      'America/Costa_Rica': { c: 'CRC', r: 530, s: '₡', name: 'Costa Rican Colón' },
      'America/Guatemala': { c: 'GTQ', r: 7.8, s: 'Q', name: 'Guatemalan Quetzal' },
      'America/Havana': { c: 'CUP', r: 24, s: '$MN', name: 'Cuban Peso' },
      'America/Jamaica': { c: 'JMD', r: 157, s: 'J$', name: 'Jamaican Dollar' },
      // Europe
      'Europe/London': { c: 'GBP', r: 0.79, s: '£', name: 'British Pound' },
      'Europe/Paris': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Berlin': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Madrid': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Rome': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Amsterdam': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Brussels': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Lisbon': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Athens': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Helsinki': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Vienna': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Dublin': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Moscow': { c: 'RUB', r: 90, s: '₽', name: 'Russian Ruble' },
      'Europe/Istanbul': { c: 'TRY', r: 32, s: '₺', name: 'Turkish Lira' },
      'Europe/Warsaw': { c: 'PLN', r: 4.0, s: 'zł', name: 'Polish Zloty' },
      'Europe/Stockholm': { c: 'SEK', r: 10.5, s: 'kr', name: 'Swedish Krona' },
      'Europe/Oslo': { c: 'NOK', r: 10.8, s: 'kr', name: 'Norwegian Krone' },
      'Europe/Copenhagen': { c: 'DKK', r: 6.9, s: 'kr', name: 'Danish Krone' },
      'Europe/Zurich': { c: 'CHF', r: 0.90, s: 'Fr', name: 'Swiss Franc' },
      'Europe/Prague': { c: 'CZK', r: 23, s: 'Kč', name: 'Czech Koruna' },
      'Europe/Budapest': { c: 'HUF', r: 360, s: 'Ft', name: 'Hungarian Forint' },
      'Europe/Bucharest': { c: 'RON', r: 4.6, s: 'lei', name: 'Romanian Leu' },
      'Europe/Sofia': { c: 'BGN', r: 1.8, s: 'лв', name: 'Bulgarian Lev' },
      'Europe/Kiev': { c: 'UAH', r: 39, s: '₴', name: 'Ukrainian Hryvnia' },
      'Europe/Minsk': { c: 'BYN', r: 3.2, s: 'Br', name: 'Belarusian Ruble' },
      'Europe/Riga': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Tallinn': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Vilnius': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      'Europe/Belgrade': { c: 'RSD', r: 107, s: 'din', name: 'Serbian Dinar' },
      'Europe/Zagreb': { c: 'EUR', r: 0.92, s: '€', name: 'Euro' },
      // Asia
      'Asia/Tokyo': { c: 'JPY', r: 150, s: '¥', name: 'Japanese Yen' },
      'Asia/Shanghai': { c: 'CNY', r: 7.2, s: '¥', name: 'Chinese Yuan' },
      'Asia/Beijing': { c: 'CNY', r: 7.2, s: '¥', name: 'Chinese Yuan' },
      'Asia/Hong_Kong': { c: 'HKD', r: 7.8, s: 'HK$', name: 'Hong Kong Dollar' },
      'Asia/Singapore': { c: 'SGD', r: 1.35, s: 'S$', name: 'Singapore Dollar' },
      'Asia/Seoul': { c: 'KRW', r: 1350, s: '₩', name: 'South Korean Won' },
      'Asia/Kolkata': { c: 'INR', r: 83, s: '₹', name: 'Indian Rupee' },
      'Asia/Colombo': { c: 'LKR', r: 310, s: 'Rs', name: 'Sri Lankan Rupee' },
      'Asia/Dhaka': { c: 'BDT', r: 110, s: '৳', name: 'Bangladeshi Taka' },
      'Asia/Kathmandu': { c: 'NPR', r: 133, s: 'Rs', name: 'Nepalese Rupee' },
      'Asia/Karachi': { c: 'PKR', r: 279, s: 'Rs', name: 'Pakistani Rupee' },
      'Asia/Dubai': { c: 'AED', r: 3.67, s: 'AED', name: 'UAE Dirham' },
      'Asia/Riyadh': { c: 'SAR', r: 3.75, s: 'SAR', name: 'Saudi Riyal' },
      'Asia/Tehran': { c: 'IRR', r: 42000, s: 'IRR', name: 'Iranian Rial' },
      'Asia/Baghdad': { c: 'IQD', r: 1310, s: 'IQD', name: 'Iraqi Dinar' },
      'Asia/Kuala_Lumpur': { c: 'MYR', r: 4.7, s: 'RM', name: 'Malaysian Ringgit' },
      'Asia/Manila': { c: 'PHP', r: 56, s: '₱', name: 'Philippine Peso' },
      'Asia/Bangkok': { c: 'THB', r: 35, s: '฿', name: 'Thai Baht' },
      'Asia/Jakarta': { c: 'IDR', r: 15800, s: 'Rp', name: 'Indonesian Rupiah' },
      'Asia/Taipei': { c: 'TWD', r: 32, s: 'NT$', name: 'New Taiwan Dollar' },
      'Asia/Amman': { c: 'JOD', r: 0.71, s: 'JD', name: 'Jordanian Dinar' },
      'Asia/Kuwait': { c: 'KWD', r: 0.31, s: 'KD', name: 'Kuwaiti Dinar' },
      'Asia/Beirut': { c: 'LBP', r: 89000, s: 'L£', name: 'Lebanese Pound' },
      'Asia/Muscat': { c: 'OMR', r: 0.38, s: 'OMR', name: 'Omani Rial' },
      'Asia/Qatar': { c: 'QAR', r: 3.64, s: 'QR', name: 'Qatari Riyal' },
      'Asia/Bahrain': { c: 'BHD', r: 0.38, s: 'BD', name: 'Bahraini Dinar' },
      'Asia/Yerevan': { c: 'AMD', r: 400, s: '֏', name: 'Armenian Dram' },
      'Asia/Tbilisi': { c: 'GEL', r: 2.7, s: '₾', name: 'Georgian Lari' },
      'Asia/Baku': { c: 'AZN', r: 1.7, s: '₼', name: 'Azerbaijani Manat' },
      'Asia/Tashkent': { c: 'UZS', r: 12500, s: 'soʻm', name: 'Uzbekistani Som' },
      'Asia/Almaty': { c: 'KZT', r: 455, s: '₸', name: 'Kazakhstani Tenge' },
      'Asia/Ho_Chi_Minh': { c: 'VND', r: 25000, s: '₫', name: 'Vietnamese Dong' },
      'Asia/Phnom_Penh': { c: 'KHR', r: 4100, s: '៛', name: 'Cambodian Riel' },
      'Asia/Rangoon': { c: 'MMK', r: 2100, s: 'K', name: 'Myanmar Kyat' },
      'Asia/Ulaanbaatar': { c: 'MNT', r: 3400, s: '₮', name: 'Mongolian Tögrög' },
      // Oceania
      'Australia/Sydney': { c: 'AUD', r: 1.53, s: 'A$', name: 'Australian Dollar' },
      'Australia/Melbourne': { c: 'AUD', r: 1.53, s: 'A$', name: 'Australian Dollar' },
      'Australia/Brisbane': { c: 'AUD', r: 1.53, s: 'A$', name: 'Australian Dollar' },
      'Australia/Perth': { c: 'AUD', r: 1.53, s: 'A$', name: 'Australian Dollar' },
      'Pacific/Auckland': { c: 'NZD', r: 1.63, s: 'NZ$', name: 'New Zealand Dollar' },
      'Pacific/Fiji': { c: 'FJD', r: 2.25, s: 'FJ$', name: 'Fijian Dollar' },
      'Pacific/Honolulu': { c: 'USD', r: 1, s: '$', name: 'US Dollar' },
    };

    if (map[tz]) return map[tz];

    const tzPrefix = tz.split('/')[0];
    const found = Object.entries(map).find(
      ([key]) => key.startsWith(tzPrefix)
    );
    if (found) return found[1];

    return { c: 'USD', r: 1, s: '$', name: 'US Dollar' };
  } catch {
    return { c: 'USD', r: 1, s: '$', name: 'US Dollar' };
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<{
    type: string; index: number; price: number;
    isCart?: boolean; cartItems?: {
      id: string; type: string; name: string;
      price: number; league?: string;
    }[];
    cartLabel?: string; signalsCount?: number;
  } | null>(null);
  const [user, setUser] = useState<{
    id: string; email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency] = useState(() => getCurrencyInfo());
  const [signalsAvailable, setSignalsAvailable] = useState(true);
  const [checkingSignals, setCheckingSignals] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('selectedPlan');
    if (!stored) { router.push('/pricing'); return; }
    setPlan(JSON.parse(stored));

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        localStorage.setItem('redirectAfterLogin', '/checkout');
        router.push('/login');
        return;
      }
      setUser(user);
    });
  }, [router]);

  useEffect(() => {
    // Check if signals are available for this type
    const checkAvailability = async () => {
      if (!plan) return;
      try {
        const { data } = await supabase
          .from('markets')
          .select('id')
          .eq('is_live', true)
          .not('league_name', 'eq',
            plan.type === 'football' ? 'AVIATOR' : 'FOOTBALL'
          )
          .limit(1);

        setSignalsAvailable((data || []).length > 0);
      } catch {
        setSignalsAvailable(true); // allow if check fails
      } finally {
        setCheckingSignals(false);
      }
    };
    if (plan) checkAvailability();
  }, [plan]);

  const getDetails = () => {
    if (!plan) return null;
    if (plan.isCart) return null;
    if (plan.type === 'football') {
      return footballPlans[plan.index] || footballPlans[0];
    }
    const aviatorIndex = plan.index >= 200 ? 0
      : plan.index >= 100 ? plan.index - 100 : 0;
    return aviatorPlans[
      Math.min(aviatorIndex, aviatorPlans.length - 1)
    ];
  };

  const details = getDetails();
  const isCart = plan?.isCart === true;

  // Calculate amount in local currency
  const usdPrice = isCart
    ? (plan?.price || 0)
    : (details?.price || 0);

  const localAmount = Math.ceil(usdPrice * currency.r);

  const handlePay = async () => {
    if (!user || !plan) return;
    setLoading(true);
    setError('');

    try {
      let signalCount = plan.signalsCount || 1;
      let bonus = 0;
      let label = plan.cartLabel || 'Signal Package';

      if (!isCart && details) {
        signalCount = 'signals' in details
          ? details.signals
          : 'games' in details ? details.games : 1;
        bonus = 'bonus' in details ? details.bonus : 0;
        label = 'tier' in details
          ? `Aviator ${details.tier}`
          : `Football ${'label' in details
            ? details.label : ''}`;
      }

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: localAmount,
          currency: currency.c,
          userId: user.id,
          planType: plan.type,
          signalsCount: signalCount,
          bonusSignals: bonus,
          planLabel: label,
        }),
      });

      const data = await res.json();

      if (data.success && data.authorizationUrl) {
        localStorage.removeItem('selectedPlan');
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.error || 'Payment initialization failed');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a1628',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{
          color: '#6b7280', fontFamily: 'sans-serif'
        }}>
          Loading...
        </p>
      </div>
    );
  }

  const signalCount = isCart
    ? (plan.signalsCount || 0)
    : details
    ? ('signals' in details ? details.signals
      : 'games' in details ? details.games : 1)
    : 1;
  const bonus = !isCart && details && 'bonus' in details
    ? details.bonus : 0;

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      color: 'white'
    }}>

      {/* Header */}
      <div style={{
        background: '#0f1f33',
        borderBottom: '1px solid #1a2740',
        padding: '14px 16px'
      }}>
        <div style={{
          maxWidth: '500px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            style={{
              background: 'none', border: 'none',
              color: '#9ca3af', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '13px', fontWeight: 700,
              touchAction: 'manipulation'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', textDecoration: 'none'
          }}>
            <div style={{
              width: '30px', height: '30px',
              background: '#22c55e', borderRadius: '8px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={14} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '16px' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <div style={{ width: '60px' }} />
        </div>
      </div>

      <div style={{
        maxWidth: '500px', margin: '0 auto',
        padding: '28px 16px'
      }}>

        {/* Order Summary */}
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '18px', padding: '22px',
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#6b7280', fontSize: '11px',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '16px'
          }}>
            Order Summary
          </p>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: '14px'
          }}>
            <div>
              {isCart ? (
                <>
                  <p style={{
                    fontWeight: 900, fontSize: '18px',
                    marginBottom: '4px'
                  }}>
                    🛒 {signalCount} Signals Bundle
                  </p>
                  <p style={{
                    color: '#22c55e', fontSize: '13px',
                    fontWeight: 700
                  }}>
                    {plan.cartLabel}
                  </p>
                </>
              ) : (
                <>
                  <p style={{
                    fontWeight: 900, fontSize: '18px',
                    marginBottom: '4px'
                  }}>
                    {plan.type === 'football' ? '⚽' : '✈️'}{' '}
                    {plan.type === 'football'
                      ? `${signalCount} Football Game${signalCount > 1 ? 's' : ''}`
                      : `${signalCount} Aviator Signal${signalCount > 1 ? 's' : ''}`
                    }
                  </p>
                  {bonus > 0 && (
                    <p style={{
                      color: '#fbbf24', fontSize: '13px',
                      fontWeight: 700
                    }}>
                      🎁 +{bonus} FREE bonus signals!
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Price in local currency */}
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontWeight: 900, fontSize: '26px',
                fontFamily: 'monospace', color: '#22c55e',
                lineHeight: 1
              }}>
                {currency.s}{localAmount.toLocaleString()}
              </p>
              <p style={{
                color: '#6b7280', fontSize: '11px',
                marginTop: '4px'
              }}>
                ≈ ${usdPrice.toFixed(2)} USD
              </p>
              <p style={{
                color: '#374151', fontSize: '11px',
                marginTop: '2px'
              }}>
                {currency.name}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div style={{
            borderTop: '1px solid #1a2740',
            paddingTop: '12px',
            display: 'flex', flexWrap: 'wrap',
            gap: '12px'
          }}>
            {[
              { icon: '✅', text: 'Unlocks instantly' },
              { icon: '⏰', text: 'Valid 24 hours' },
              { icon: '🔒', text: 'Secure payment' },
            ].map(item => (
              <span key={item.text} style={{
                color: '#6b7280', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{
                color: '#6b7280', fontSize: '11px',
                fontWeight: 700, textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                Paying As
              </p>
              <p style={{ fontWeight: 700, fontSize: '14px' }}>
                {user?.email}
              </p>
            </div>
            <div style={{
              width: '36px', height: '36px',
              background: 'rgba(34,197,94,0.1)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={18} color="#22c55e" />
            </div>
          </div>
        </div>

        {/* Currency Info */}
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: '14px', padding: '14px 16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '8px'
          }}>
            <p style={{
              color: '#86efac', fontSize: '13px', fontWeight: 700
            }}>
              💱 Your Local Currency
            </p>
            <span style={{
              background: 'rgba(34,197,94,0.1)',
              color: '#22c55e', fontSize: '11px',
              fontWeight: 700, padding: '3px 8px',
              borderRadius: '20px'
            }}>
              {currency.c}
            </span>
          </div>
          <p style={{
            color: '#6b7280', fontSize: '13px', lineHeight: 1.6
          }}>
            You are being charged in{' '}
            <strong style={{ color: '#9ca3af' }}>
              {currency.name} ({currency.c})
            </strong>
            . The equivalent in USD is{' '}
            <strong style={{ color: '#9ca3af' }}>
              ${usdPrice.toFixed(2)}
            </strong>
            .
          </p>
        </div>

        {/* Paystack Info */}
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>💳</span>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>
              Pay with Paystack
            </p>
          </div>
          <p style={{
            color: '#6b7280', fontSize: '13px', lineHeight: 1.6
          }}>
            You'll be redirected to Paystack's secure page.
            Pay with card, M-Pesa, or mobile money.
            No Paystack account needed.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '14px',
            marginBottom: '16px'
          }}>
            <p style={{
              color: '#f87171', fontSize: '14px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* No signals warning */}
        {!checkingSignals && !signalsAvailable && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.4)',
            borderRadius: '14px', padding: '18px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{
                  fontWeight: 900, fontSize: '15px',
                  color: '#f87171', marginBottom: '6px'
                }}>
                  No Signals Available Right Now
                </p>
                <p style={{
                  color: '#fca5a5', fontSize: '13px', lineHeight: 1.6,
                  marginBottom: '10px'
                }}>
                  Our team has not dispatched{' '}
                  {plan?.type === 'football' ? 'football' : 'aviator'}{' '}
                  signals for today yet. Please wait until signals
                  are available before purchasing to ensure you
                  receive your service.
                </p>
                <Link href={`/${plan?.type}`} style={{
                  display: 'inline-block',
                  background: '#374151', color: 'white',
                  padding: '8px 16px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  ← Check Signal Availability
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading || !signalsAvailable}
          style={{
            width: '100%',
            background: loading || !signalsAvailable ? '#374151' : '#22c55e',
            color: loading || !signalsAvailable ? '#6b7280' : 'black',
            border: 'none', borderRadius: '16px',
            padding: '20px', fontSize: '18px',
            fontWeight: 900,
            cursor: loading || !signalsAvailable ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            display: 'block', marginBottom: '14px',
            boxShadow: loading || !signalsAvailable
              ? 'none'
              : '0 8px 25px rgba(34,197,94,0.35)',
            transition: 'all 0.2s'
          }}
        >
          {loading
            ? '⏳ Redirecting...'
            : !signalsAvailable
            ? '⏳ Waiting for signals...'
            : `💳 Pay ${currency.s}${localAmount.toLocaleString()} via Paystack`
          }
        </button>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px'
        }}>
          <Lock size={12} color="#374151" />
          <p style={{
            color: '#374151', fontSize: '12px',
            textAlign: 'center'
          }}>
            Secured by Paystack · SSL Encrypted ·{' '}
            {currency.name}
          </p>
        </div>

      </div>
    </div>
  );
}
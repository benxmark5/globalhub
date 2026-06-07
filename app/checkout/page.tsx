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
  { games: 1,   price: 1.20,  label: '1 Game',    bonus: 0 },
  { games: 2,   price: 2.40,  label: '2 Games',   bonus: 0 },
  { games: 3,   price: 4.00,  label: '3 Games',   bonus: 0 },
  { games: 5,   price: 6.00,  label: '5 Games',   bonus: 0 },
  { games: 8,   price: 9.00,  label: '8 Games',   bonus: 0 },
  { games: 10,  price: 12.00, label: '10 Games',  bonus: 0 },
  { games: 15,  price: 18.00, label: '15 Games',  bonus: 0 },
  { games: 20,  price: 25.00, label: '20 Games',  bonus: 0 },
  { games: 30,  price: 35.00, label: '30 Games',  bonus: 0 },
  { games: 50,  price: 55.00, label: '50 Games',  bonus: 2 },
  { games: 75,  price: 75.00, label: '75 Games',  bonus: 2 },
  { games: 100, price: 100.00,label: '100 Games', bonus: 2 },
];

const aviatorPlans = [
  { tier: 'SINGLE', signals: 1,  price: 3  },
  { tier: 'NORMAL', signals: 4,  price: 10 },
  { tier: 'VIP',    signals: 8,  price: 18 },
  { tier: 'VVIP',   signals: 12, price: 25 },
];

// ── Currency type ─────────────────────────────
type CurrencyInfo = {
  c: string; r: number; s: string;
  name: string; flag: string;
};

const FALLBACK_CURRENCY: CurrencyInfo = {
  c: 'USD', r: 1, s: '$', name: 'US Dollar', flag: '🌍'
};

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<{
    type: string; index: number; price: number;
    isCart?: boolean;
    cartItems?: { id: string; type: string; name: string; price: number; league?: string }[];
    cartLabel?: string; signalsCount?: number;
  } | null>(null);
  const [user, setUser] = useState<{
    id: string; email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<CurrencyInfo>(FALLBACK_CURRENCY);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const [signalsAvailable, setSignalsAvailable] = useState(true);
  const [checkingSignals, setCheckingSignals] = useState(true);

  // ── Load plan & user ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('selectedPlan');
    if (!stored) { router.push('/pricing'); return; }
    setPlan(JSON.parse(stored));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        localStorage.setItem('redirectAfterLogin', '/checkout');
        router.push('/login');
        return;
      }
      setUser(session.user);
    });
  }, [router]);

  // ── Load currency via IP detection ───────────
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        // Check localStorage cache first (set by VisitorTracker)
        const cached = localStorage.getItem('gh_currency');
        if (cached) {
          const data = JSON.parse(cached);
          setCurrency({
            c: data.currency || 'USD',
            r: data.rate || 1,
            s: data.symbol || '$',
            name: data.name || 'US Dollar',
            flag: data.flag || '🌍',
          });
          setCurrencyLoading(false);
          return;
        }

        // Fetch from IP detection API
        const res = await fetch('/api/detect-location');
        if (res.ok) {
          const data = await res.json();
          const curr: CurrencyInfo = {
            c: data.currency || 'USD',
            r: data.rate || 1,
            s: data.symbol || '$',
            name: data.name || 'US Dollar',
            flag: data.flag || '🌍',
          };
          setCurrency(curr);
          // Cache for next time
          localStorage.setItem('gh_currency', JSON.stringify({
            currency: curr.c,
            symbol: curr.s,
            rate: curr.r,
            name: curr.name,
            flag: curr.flag,
          }));
        }
      } catch {
        // Keep fallback USD
      } finally {
        setCurrencyLoading(false);
      }
    };
    loadCurrency();
  }, []);

  // ── Check signal availability ─────────────────
  useEffect(() => {
    const checkAvailability = async () => {
      if (!plan) return;
      try {
        const { data } = await supabase
          .from('markets')
          .select('id')
          .eq('is_live', true)
          .not('league_name', 'eq', plan.type === 'football' ? 'AVIATOR' : 'FOOTBALL')
          .gt('expires_at', new Date().toISOString())
          .limit(1);
        setSignalsAvailable((data || []).length > 0);
      } catch {
        setSignalsAvailable(true);
      } finally {
        setCheckingSignals(false);
      }
    };
    if (plan) checkAvailability();
  }, [plan]);

  // ── Helpers ───────────────────────────────────
  const getDetails = () => {
    if (!plan || plan.isCart) return null;
    if (plan.type === 'football') return footballPlans[plan.index] || footballPlans[0];
    const idx = plan.index >= 100 ? plan.index - 100 : 0;
    return aviatorPlans[Math.min(idx, aviatorPlans.length - 1)];
  };

  const details = getDetails();
  const isCart = plan?.isCart === true;
  const usdPrice = isCart ? (plan?.price || 0) : (details?.price || 0);
  const localAmount = currencyLoading ? 0 : Math.ceil(usdPrice * currency.r);

  const signalCount = isCart
    ? (plan?.signalsCount || 0)
    : details
    ? ('signals' in details ? details.signals : 'games' in details ? details.games : 1)
    : 1;

  const bonus = !isCart && details && 'bonus' in details ? details.bonus : 0;

  // ── Pay ───────────────────────────────────────
  const handlePay = async () => {
    if (!user || !plan) return;
    setLoading(true);
    setError('');
    try {
      let sCount = plan.signalsCount || 1;
      let bonusCount = 0;
      let label = plan.cartLabel || 'Signal Package';

      if (!isCart && details) {
        sCount = 'signals' in details ? details.signals : 'games' in details ? details.games : 1;
        bonusCount = 'bonus' in details ? details.bonus : 0;
        label = 'tier' in details
          ? `Aviator ${details.tier}`
          : `Football ${'label' in details ? details.label : ''}`;
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
          signalsCount: sCount,
          bonusSignals: bonusCount,
          planLabel: label,
          visitorCountry: localStorage.getItem('gh_location')
            ? JSON.parse(localStorage.getItem('gh_location')!).country
            : 'Unknown',
          visitorCurrency: currency.c,
        }),
      });

      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        localStorage.removeItem('selectedPlan');
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.error || 'Payment initialization failed. Try again.');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────
  if (!plan) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#0a1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ color: '#6b7280', fontFamily: 'sans-serif' }}>Loading...</p>
      </div>
    );
  }

  const canPay = !loading && signalsAvailable && !currencyLoading;

  // ── Render ─────────────────────────────────────
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <button type="button" onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '6px', fontSize: '13px', fontWeight: 700,
            touchAction: 'manipulation'
          }}>
            <ArrowLeft size={16} /> Back
          </button>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '30px', height: '30px', background: '#22c55e',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
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

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Order Summary */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '18px', padding: '22px', marginBottom: '16px'
        }}>
          <p style={{
            color: '#6b7280', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px'
          }}>
            Order Summary
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              {isCart ? (
                <>
                  <p style={{ fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>
                    🛒 {signalCount} Signals Bundle
                  </p>
                  <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 700 }}>
                    {plan.cartLabel}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>
                    {plan.type === 'football' ? '⚽' : '✈️'}{' '}
                    {plan.type === 'football'
                      ? `${signalCount} Football Game${signalCount > 1 ? 's' : ''}`
                      : `${signalCount} Aviator Signal${signalCount > 1 ? 's' : ''}`
                    }
                  </p>
                  {bonus > 0 && (
                    <p style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700 }}>
                      🎁 +{bonus} FREE bonus signals!
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Price block */}
            <div style={{ textAlign: 'right' }}>
              {currencyLoading ? (
                <p style={{ color: '#6b7280', fontSize: '14px', fontFamily: 'monospace' }}>
                  Detecting currency...
                </p>
              ) : (
                <>
                  <p style={{
                    fontWeight: 900, fontSize: '26px',
                    fontFamily: 'monospace', color: '#22c55e', lineHeight: 1
                  }}>
                    {currency.flag} {currency.s}{localAmount.toLocaleString()}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                    ≈ ${usdPrice.toFixed(2)} USD
                  </p>
                  <p style={{ color: '#374151', fontSize: '11px', marginTop: '2px' }}>
                    {currency.name}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div style={{
            borderTop: '1px solid #1a2740', paddingTop: '12px',
            display: 'flex', flexWrap: 'wrap', gap: '12px'
          }}>
            {[
              { icon: '✅', text: 'Unlocks instantly' },
              { icon: '⏰', text: plan.type === 'aviator' ? 'Valid 20 mins' : 'Valid 24 hours' },
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
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px', marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{
                color: '#6b7280', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', marginBottom: '4px'
              }}>
                Paying As
              </p>
              <p style={{ fontWeight: 700, fontSize: '14px' }}>{user?.email}</p>
            </div>
            <div style={{
              width: '36px', height: '36px',
              background: 'rgba(34,197,94,0.1)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={18} color="#22c55e" />
            </div>
          </div>
        </div>

        {/* Currency Info Box */}
        {!currencyLoading && (
          <div style={{
            background: 'rgba(34,197,94,0.05)',
            border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: '14px', padding: '14px 16px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ color: '#86efac', fontSize: '13px', fontWeight: 700 }}>
                {currency.flag} Your Local Currency Detected
              </p>
              <span style={{
                background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                fontSize: '11px', fontWeight: 700,
                padding: '3px 8px', borderRadius: '20px'
              }}>
                {currency.c}
              </span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
              Charged in <strong style={{ color: '#9ca3af' }}>{currency.name} ({currency.c})</strong>
              {' '}· Base price{' '}
              <strong style={{ color: '#9ca3af' }}>${usdPrice.toFixed(2)} USD</strong>
            </p>
          </div>
        )}

        {/* Payment method */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>💳</span>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>Pay with Paystack</p>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6 }}>
            Secured redirect to Paystack. Pay with card, M-Pesa, or mobile money.
            No Paystack account required.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '14px', marginBottom: '16px'
          }}>
            <p style={{ color: '#f87171', fontSize: '14px', textAlign: 'center' }}>⚠️ {error}</p>
          </div>
        )}

        {/* No signals warning */}
        {!checkingSignals && !signalsAvailable && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '2px solid rgba(239,68,68,0.35)',
            borderRadius: '14px', padding: '18px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 900, fontSize: '15px', color: '#f87171', marginBottom: '6px' }}>
                  No Signals Available Right Now
                </p>
                <p style={{ color: '#fca5a5', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
                  Our team has not dispatched{' '}
                  {plan?.type === 'football' ? 'football' : 'aviator'} signals yet today.
                  Please wait until signals appear on the signals page before purchasing.
                </p>
                <Link href={`/${plan?.type}`} style={{
                  display: 'inline-block', background: '#374151', color: 'white',
                  padding: '8px 16px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700, textDecoration: 'none'
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
          disabled={!canPay}
          style={{
            width: '100%',
            background: !canPay ? '#1a2740' : '#22c55e',
            color: !canPay ? '#374151' : 'black',
            border: 'none', borderRadius: '16px',
            padding: '20px', fontSize: '18px', fontWeight: 900,
            cursor: !canPay ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation', display: 'block',
            marginBottom: '14px',
            boxShadow: !canPay ? 'none' : '0 8px 25px rgba(34,197,94,0.35)',
            transition: 'all 0.2s'
          }}
        >
          {currencyLoading
            ? '⏳ Detecting your currency...'
            : loading
            ? '⏳ Redirecting to Paystack...'
            : !signalsAvailable
            ? '⏳ No signals dispatched yet'
            : `${currency.flag} Pay ${currency.s}${localAmount.toLocaleString()} via Paystack`
          }
        </button>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px'
        }}>
          <Lock size={12} color="#374151" />
          <p style={{ color: '#374151', fontSize: '12px', textAlign: 'center' }}>
            Secured by Paystack · SSL Encrypted · {currency.name}
          </p>
        </div>

      </div>
    </div>
  );
}
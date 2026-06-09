"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, CheckCircle,
  ShieldCheck, Zap, Lock, Globe, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';
import CurrencySelector from '../components/CurrencySelector';
import { toLocalAmount, formatAmount } from '../lib/currency';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { currency, setCurrency, loading: currencyLoading } = useCurrency();

  const [plan, setPlan] = useState<{
    type: string; index: number; price: number;
    isCart?: boolean;
    cartItems?: { id: string; type: string; name: string; price: number }[];
    cartLabel?: string; signalsCount?: number;
  } | null>(null);

  const [user, setUser] = useState<{
    id: string; email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signalsAvailable, setSignalsAvailable] = useState(true);
  const [checkingSignals, setCheckingSignals] = useState(true);

  // ── Init ────────────────────────────────────
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

  // ── Signal availability ─────────────────────
  useEffect(() => {
    const check = async () => {
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
      } catch { setSignalsAvailable(true); }
      finally { setCheckingSignals(false); }
    };
    if (plan) check();
  }, [plan]);

  // ── Derived values ──────────────────────────
  const getDetails = () => {
    if (!plan || plan.isCart) return null;
    if (plan.type === 'football') return footballPlans[plan.index] || footballPlans[0];
    const idx = plan.index >= 100 ? plan.index - 100 : 0;
    return aviatorPlans[Math.min(idx, aviatorPlans.length - 1)];
  };

  const details = getDetails();
  const isCart = plan?.isCart === true;
  const usdPrice = isCart ? (plan?.price || 0) : (details?.price || 0);
  const localAmount = toLocalAmount(usdPrice, currency);
  const displayAmount = formatAmount(localAmount, currency);
  const bonus = !isCart && details && 'bonus' in details ? details.bonus : 0;
  const signalCount = isCart
    ? (plan?.signalsCount || 0)
    : details
    ? ('signals' in details ? details.signals : 'games' in details ? details.games : 1)
    : 1;

  const isAviator = plan?.type === 'aviator';
  const canPay = !loading && signalsAvailable && !currencyLoading;

  // ── Payment ─────────────────────────────────
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
        headers: { 
          'Content-Type': 'application/json',
          'x-base-usd': String(usdPrice)
        },
        body: JSON.stringify({
          email: user.email,
          amount: localAmount,
          currency: currency.code,
          userId: user.id,
          planType: plan.type,
          signalsCount: sCount,
          bonusSignals: bonusCount,
          planLabel: label,
          visitorCountry: currency.country,
          visitorCurrency: currency.code,
        }),
      });

      const data = await res.json();

      if (data.success && data.authorizationUrl) {
        try {
          await supabase.from('purchases')
            .update({
              visitor_country: currency.country,
              visitor_currency: currency.code,
            })
            .eq('reference', data.reference);
        } catch { /* non-critical */ }

        localStorage.removeItem('selectedPlan');
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.error || 'Payment failed. Please try again.');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      color: 'white'
    }}>

      {/* ── Top bar ── */}
      <div style={{
        background: '#0a1628',
        borderBottom: '1px solid #1a2740',
        padding: '12px 16px'
      }}>
        <div style={{
          maxWidth: '520px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button type="button" onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '6px', fontSize: '13px', fontWeight: 700,
            touchAction: 'manipulation'
          }}>
            <ArrowLeft size={15} /> Back
          </button>

          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none'
          }}>
            <div style={{
              width: '28px', height: '28px', background: '#22c55e',
              borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={13} color="black" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '15px', color: 'white' }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>

          <CurrencySelector
            current={currency}
            onChange={setCurrency}
            compact
          />
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div style={{
        background: 'rgba(34,197,94,0.04)',
        borderBottom: '1px solid rgba(34,197,94,0.1)',
        padding: '8px 16px'
      }}>
        <div style={{
          maxWidth: '520px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '20px',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: ShieldCheck, label: 'Secure Checkout', color: '#22c55e' },
            { icon: Lock, label: 'SSL Encrypted', color: '#60a5fa' },
            { icon: Zap, label: 'Instant Delivery', color: '#fbbf24' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <Icon size={13} color={color} />
              <span style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* ── Page title ── */}
        <h1 style={{
          fontWeight: 900, fontSize: '20px', marginBottom: '20px',
          letterSpacing: '-0.5px'
        }}>
          Complete Your Purchase
        </h1>

        {/* ── Order card ── */}
        <div style={{
          background: '#0a1628',
          border: '1px solid #1a2740',
          borderRadius: '16px', overflow: 'hidden',
          marginBottom: '14px'
        }}>
          {/* Header */}
          <div style={{
            background: '#0f1f33',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1a2740'
          }}>
            <p style={{
              color: '#6b7280', fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Order Summary
            </p>
            <span style={{
              background: isAviator ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              color: isAviator ? '#f87171' : '#22c55e',
              fontSize: '10px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '20px',
              textTransform: 'uppercase'
            }}>
              {isAviator ? '✈️ Aviator' : '⚽ Football'}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '18px' }}>
            {/* Product description */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '16px'
            }}>
              <div>
                {isCart ? (
                  <>
                    <p style={{ fontWeight: 900, fontSize: '17px', marginBottom: '3px' }}>
                      🛒 {signalCount} Signals Bundle
                    </p>
                    <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 700 }}>
                      {plan.cartLabel}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 900, fontSize: '17px', marginBottom: '3px' }}>
                      {isAviator
                        ? `${signalCount} Aviator Signal${signalCount > 1 ? 's' : ''}`
                        : `${signalCount} Football Game${signalCount > 1 ? 's' : ''}`
                      }
                    </p>
                    {bonus > 0 && (
                      <p style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>
                        🎁 +{bonus} free bonus signals!
                      </p>
                    )}
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      {isAviator ? 'Active for 20 minutes' : 'Valid for 24 hours'}
                    </p>
                  </>
                )}
              </div>

              {/* Price in local currency */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {currencyLoading ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280'
                  }}>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '13px' }}>Detecting...</span>
                  </div>
                ) : (
                  <>
                    <p style={{
                      fontWeight: 900, fontSize: '24px',
                      fontFamily: 'monospace', color: '#22c55e',
                      lineHeight: 1
                    }}>
                      {displayAmount}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                      = ${usdPrice.toFixed(2)} USD
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Currency info row */}
            <div style={{
              background: '#060f1e',
              border: '1px solid #1a2740',
              borderRadius: '10px', padding: '10px 14px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} color="#22c55e" />
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {currency.flag} {currency.country} · {currency.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '20px'
                }}>
                  {currency.code}
                </span>
                <CurrencySelector current={currency} onChange={setCurrency} compact />
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment method info ── */}
        <div style={{
          background: '#0a1628', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '16px', marginBottom: '14px'
        }}>
          <p style={{
            fontWeight: 700, fontSize: '13px', marginBottom: '10px',
            color: 'white'
          }}>
            💳 Accepted Payment Methods
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {/* Always show cards */}
            {['Visa', 'Mastercard', 'Amex'].map(card => (
              <span key={card} style={{
                background: '#0f1f33', border: '1px solid #1a2740',
                color: '#d1d5db', fontSize: '12px',
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600
              }}>
                {card === 'Visa' ? '💙' : card === 'Mastercard' ? '🔴' : '💚'} {card}
              </span>
            ))}

            {/* Only show M-Pesa & Airtel Money for Kenyan users */}
            {currency.countryCode === 'KE' && (
              <>
                <span style={{
                  background: '#0f1f33', border: '1px solid #1a2740',
                  color: '#d1d5db', fontSize: '12px',
                  padding: '6px 12px', borderRadius: '8px', fontWeight: 600
                }}>
                  📱 M-Pesa
                </span>
                <span style={{
                  background: '#0f1f33', border: '1px solid #1a2740',
                  color: '#d1d5db', fontSize: '12px',
                  padding: '6px 12px', borderRadius: '8px', fontWeight: 600
                }}>
                  📱 Airtel Money
                </span>
              </>
            )}

            {/* International users alternative context flag */}
            {currency.countryCode !== 'KE' && (
              <span style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#86efac', fontSize: '12px',
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600
              }}>
                🌍 International Cards Accepted
              </span>
            )}
          </div>
        </div>

        {/* ── Account card ── */}
        <div style={{
          background: '#0a1628', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '14px 18px',
          marginBottom: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{
              color: '#6b7280', fontSize: '10px', fontWeight: 700,
              textTransform: 'uppercase', marginBottom: '4px'
            }}>
              Paying As
            </p>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>{user?.email}</p>
          </div>
          <CheckCircle size={20} color="#22c55e" />
        </div>

        {/* ── No signals warning ── */}
        {!checkingSignals && !signalsAvailable && (
          <div style={{
            background: 'rgba(239,68,68,0.07)',
            border: '2px solid rgba(239,68,68,0.3)',
            borderRadius: '14px', padding: '16px',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '22px', flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 900, fontSize: '14px', color: '#f87171', marginBottom: '6px' }}>
                  No Signals Available Right Now
                </p>
                <p style={{ color: '#fca5a5', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
                  Signals for today haven't been dispatched yet.
                  Please wait until signals are available before purchasing.
                </p>
                <Link href={`/${plan?.type}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#374151', color: 'white',
                  padding: '7px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700, textDecoration: 'none'
                }}>
                  <ArrowLeft size={12} /> Check Availability
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '14px'
          }}>
            <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* ── CTA button ── */}
        <button
          type="button"
          onClick={handlePay}
          disabled={!canPay}
          style={{
            width: '100%',
            background: !canPay
              ? '#1a2740'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: !canPay ? '#374151' : 'black',
            border: 'none', borderRadius: '14px',
            padding: '18px 20px', fontSize: '17px', fontWeight: 900,
            cursor: !canPay ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation', display: 'block',
            marginBottom: '12px',
            boxShadow: !canPay ? 'none' : '0 8px 25px rgba(34,197,94,0.3)',
            transition: 'all 0.2s', letterSpacing: '0.02em'
          }}
        >
          {currencyLoading
            ? '⏳ Detecting your currency...'
            : loading
            ? '⏳ Processing...'
            : !signalsAvailable
            ? '⏳ Waiting for signals...'
            : `Complete Purchase · ${displayAmount}`
          }
        </button>

        {/* ── Trust line ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '16px',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: Lock, label: 'SSL Encrypted' },
            { icon: ShieldCheck, label: 'Secure Checkout' },
            { icon: Zap, label: 'Instant Delivery' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <Icon size={11} color="#374151" />
              <span style={{ color: '#374151', fontSize: '11px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Payment notice ── */}
        <p style={{
          textAlign: 'center', color: '#1a2740',
          fontSize: '11px', marginTop: '12px'
        }}>
          Payment processed securely · {currency.code} · Powered by Paystack
        </p>

      </div>
    </div>
  );
}
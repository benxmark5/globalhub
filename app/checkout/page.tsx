"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, ArrowLeft, CheckCircle, Lock, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

type CartItem = {
  id: string;
  type: string;
  name: string;
  price: number;
  league: string;
};

type StoredPlan = {
  type: string;
  index: number;
  price: number;
  isCart?: boolean;
  cartItems?: CartItem[];
  cartLabel?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const getDetails = () => {
    if (!plan || plan.isCart) return null;
    if (plan.type === 'football') {
      return footballPlans[plan.index] || footballPlans[0];
    }
    const idx = plan.index >= 200 ? 0
      : plan.index >= 100 ? plan.index - 100 : 0;
    return aviatorPlans[Math.min(idx, aviatorPlans.length - 1)];
  };

  const details = getDetails();

  // Check if this is a cart checkout
  const isCart = plan?.isCart === true;
  const cartItems = plan?.cartItems || [];
  const cartLabel = plan?.cartLabel || '';

  // Amount — use plan price directly if cart (already calculated in cart)
  const amountKES = isCart
    ? Math.ceil((plan?.price || 0) * 130)
    : details
    ? Math.floor(details.price * 130)
    : 0;

  const handlePay = async () => {
    if (!user || (!details && !isCart) || !plan) return;
    setLoading(true);
    setError('');

    try {
      const signalCount = isCart
        ? cartItems.length
        : details && 'signals' in details
        ? details.signals
        : details && 'games' in details ? details.games : 1;

      const bonus = details && 'bonus' in details ? details.bonus : 0;

      const label = isCart
        ? cartLabel
        : details && 'tier' in details
        ? `Aviator ${details.tier}`
        : `Football ${details && 'label' in details ? details.label : ''}`;

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: amountKES,
          userId: user.id,
          planType: plan.type,
          signalsCount: signalCount,
          bonusSignals: bonus,
          planLabel: label,
          // Pass metadata securely if your backend reads explicit cart items
          metadata: isCart ? { cartItems } : undefined
        }),
      });

      const data = await res.json();

      if (data.success && data.authorizationUrl) {
        localStorage.removeItem('selectedPlan');
        // Redirect to Paystack
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

  if (!plan || (!details && !isCart)) {
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
    ? cartItems.length
    : details && 'signals' in details
    ? details.signals
    : details && 'games' in details ? details.games : 1;
    
  const bonus = details && 'bonus' in details ? details.bonus : 0;

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
            onClick={() => router.push(isCart ? '/cart' : '/pricing')}
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
                <div>
                  <p style={{ fontWeight: 900, fontSize: '18px', marginBottom: '6px' }}>
                    <ShoppingCart size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Cart Checkout
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                    {signalCount} Custom Selected Items
                  </p>
                </div>
              ) : (
                <div>
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
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontWeight: 900, fontSize: '24px',
                fontFamily: 'monospace', color: '#22c55e'
              }}>
                KES {amountKES.toLocaleString()}
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px' }}>
                ≈ ${(plan?.price || 0).toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Cart Specific Itemized List Preview */}
          {isCart && cartItems.length > 0 && (
            <div style={{
              margin: '12px 0', padding: '10px 0',
              borderTop: '1px dashed #1a2740',
              display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
              {cartItems.map((item, index) => (
                <div key={item.id || index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af' }}>
                  <span>{item.type === 'football' ? '⚽' : '✈️'} {item.name || 'Signal Item'}</span>
                  <span style={{ fontFamily: 'monospace' }}>${(item.price || 3).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{
            borderTop: '1px solid #1a2740', paddingTop: '12px',
            display: 'flex', gap: '16px', flexWrap: 'wrap'
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
              <p style={{
                fontWeight: 700, fontSize: '14px'
              }}>
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

        {/* Paystack Info */}
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.15)',
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
            color: '#6b7280', fontSize: '13px',
            lineHeight: 1.6
          }}>
            You'll be redirected to Paystack's secure payment page.
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

        {/* PAY BUTTON */}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#374151' : '#22c55e',
            color: loading ? '#6b7280' : 'black',
            border: 'none', borderRadius: '16px',
            padding: '20px', fontSize: '18px',
            fontWeight: 900, cursor: loading
              ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            display: 'block',
            marginBottom: '14px',
            boxShadow: loading
              ? 'none'
              : '0 8px 25px rgba(34,197,94,0.35)',
            transition: 'all 0.2s',
            position: 'relative',
            zIndex: 1
          }}
        >
          {loading
            ? '⏳ Redirecting...'
            : `💳 Pay KES ${amountKES.toLocaleString()} via Paystack`
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
            Secured by Paystack · SSL Encrypted
          </p>
        </div>

      </div>
    </div>
  );
}
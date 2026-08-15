"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Trash2, TrendingUp,
  Zap, ArrowRight, Trophy, Package
} from 'lucide-react';
import { useCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/lib/useCurrency';
import { toLocalAmount, formatAmount } from '@/lib/currency';

export default function CartPage() {
  const { items, removeItem, clearCart, total, count } = useCart();
  const { currency } = useCurrency();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/cart');
      router.push('/login');
      return;
    }
    if (items.length === 0) return;
    setLoading(true);

    const footballItems = items.filter(i => i.type === 'football');
    const aviatorItems = items.filter(i => i.type === 'aviator');
    const primaryType = footballItems.length >= aviatorItems.length
      ? 'football' : 'aviator';

    const label = [
      footballItems.length > 0
        ? `${footballItems.length} Football Signal${footballItems.length > 1 ? 's' : ''}`
        : null,
      aviatorItems.length > 0
        ? `${aviatorItems.length} Aviator Signal${aviatorItems.length > 1 ? 's' : ''}`
        : null,
    ].filter(Boolean).join(' + ');

    localStorage.setItem('selectedPlan', JSON.stringify({
      type: primaryType,
      index: 0,
      price: total,
      cartItems: items,
      cartLabel: label,
      signalsCount: items.length,
      isCart: true,
    }));

    router.push('/checkout');
    setLoading(false);
  };

  const localTotal = toLocalAmount(total, currency);
  const displayTotal = formatAmount(localTotal, currency);

  const footballItems = items.filter(i => i.type === 'football');
  const aviatorItems = items.filter(i => i.type === 'aviator');

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        background: '#0f1f33',
        borderBottom: '1px solid #1a2740',
        padding: '14px 16px'
      }}>
        <div style={{
          maxWidth: '560px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button type="button" onClick={() => router.back()} style={{
            background: 'none', border: 'none',
            color: '#9ca3af', cursor: 'pointer',
            fontSize: '13px', fontWeight: 700,
            touchAction: 'manipulation'
          }}>
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', background: '#22c55e', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={13} color="black" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '15px' }}>
                GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
              </span>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={16} color="#22c55e" />
            <span style={{ fontWeight: 900, fontSize: '14px' }}>
              Cart ({count})
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Empty cart */}
        {items.length === 0 && (
          <div style={{
            background: '#0f1f33',
            border: '1px solid #1a2740',
            borderRadius: '20px', padding: '48px 24px',
            textAlign: 'center'
          }}>
            <Package size={52} color="#374151" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '10px' }}>
              Your cart is empty
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
              Choose your signals package and add it to your cart
              to unlock expert predictions.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/football" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: '#22c55e', color: 'black',
                padding: '13px 22px', borderRadius: '11px',
                fontWeight: 900, fontSize: '14px', textDecoration: 'none'
              }}>
                <TrendingUp size={16} /> Football Signals
              </Link>
              <Link href="/aviator" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: '#ef4444', color: 'white',
                padding: '13px 22px', borderRadius: '11px',
                fontWeight: 900, fontSize: '14px', textDecoration: 'none'
              }}>
                <Zap size={16} /> Aviator Signals
              </Link>
            </div>
          </div>
        )}

        {/* Cart items */}
        {items.length > 0 && (
          <>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '14px'
            }}>
              <h2 style={{ fontWeight: 900, fontSize: '18px' }}>
                🛒 Shopping Cart
              </h2>
              <button type="button" onClick={clearCart} style={{
                background: 'none', border: 'none',
                color: '#6b7280', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700,
                touchAction: 'manipulation'
              }}>
                Clear All
              </button>
            </div>

            {/* Football section */}
            {footballItems.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{
                  color: '#22c55e', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  ⚽ Football Signals ({footballItems.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {footballItems.map(item => (
                    <div key={item.id} style={{
                      background: '#0f1f33',
                      border: '1px solid #1a2740',
                      borderRadius: '12px', padding: '14px 16px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: '12px'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                          {item.home && item.away
                            ? `${item.home} vs ${item.away}`
                            : item.name
                          }
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>
                          {item.league || 'Football'}{' '}
                          {item.tier && (
                            <span style={{
                              color: item.tier === 'super' ? '#a78bfa'
                                : item.tier === 'big' ? '#fbbf24' : '#6b7280',
                              fontWeight: 700, marginLeft: '4px',
                              textTransform: 'uppercase', fontSize: '10px'
                            }}>
                              [{item.tier}]
                            </span>
                          )}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#22c55e', fontWeight: 900, fontFamily: 'monospace', fontSize: '14px' }}>
                            {formatAmount(toLocalAmount(item.price, currency), currency)}
                          </p>
                          <p style={{ color: '#374151', fontSize: '10px' }}>
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#f87171', cursor: 'pointer',
                          padding: '6px', borderRadius: '7px',
                          touchAction: 'manipulation',
                          display: 'flex', alignItems: 'center'
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aviator section */}
            {aviatorItems.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{
                  color: '#f87171', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  ✈️ Aviator Signals ({aviatorItems.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aviatorItems.map(item => (
                    <div key={item.id} style={{
                      background: '#0f1f33',
                      border: '1px solid #1a2740',
                      borderRadius: '12px', padding: '14px 16px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                          {item.name}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>Aviator Signal</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#f87171', fontWeight: 900, fontFamily: 'monospace', fontSize: '14px' }}>
                            {formatAmount(toLocalAmount(item.price, currency), currency)}
                          </p>
                          <p style={{ color: '#374151', fontSize: '10px' }}>
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#f87171', cursor: 'pointer',
                          padding: '6px', borderRadius: '7px',
                          touchAction: 'manipulation',
                          display: 'flex', alignItems: 'center'
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order summary */}
            <div style={{
              background: '#0f1f33',
              border: '1px solid #1a2740',
              borderRadius: '14px', padding: '18px',
              marginBottom: '14px'
            }}>
              <p style={{
                color: '#6b7280', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', marginBottom: '12px'
              }}>
                Order Summary
              </p>
              {footballItems.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                    ⚽ {footballItems.length} Football Signal{footballItems.length > 1 ? 's' : ''}
                  </span>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                    {formatAmount(
                      toLocalAmount(footballItems.reduce((s, i) => s + i.price, 0), currency),
                      currency
                    )}
                  </span>
                </div>
              )}
              {aviatorItems.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                    ✈️ {aviatorItems.length} Aviator Signal{aviatorItems.length > 1 ? 's' : ''}
                  </span>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                    {formatAmount(
                      toLocalAmount(aviatorItems.reduce((s, i) => s + i.price, 0), currency),
                      currency
                    )}
                  </span>
                </div>
              )}
              <div style={{
                borderTop: '1px solid #1a2740',
                paddingTop: '12px', marginTop: '8px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 900, fontSize: '15px' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, fontSize: '22px', fontFamily: 'monospace', color: '#22c55e' }}>
                    {displayTotal}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '11px' }}>
                    = ${total.toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout button */}
            <button type="button" onClick={handleCheckout} disabled={loading} style={{
              width: '100%',
              background: loading ? '#374151' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: loading ? '#6b7280' : 'black',
              border: 'none', borderRadius: '14px',
              padding: '18px', fontSize: '17px', fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              touchAction: 'manipulation', marginBottom: '12px',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px'
            }}>
              {loading ? '⏳ Processing...' : (
                <>
                  Complete Secure Checkout
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Trust */}
            <p style={{ textAlign: 'center', color: '#374151', fontSize: '12px' }}>
              🔒 SSL Encrypted · 🌍 International Payments · ⚡ Instant Delivery
            </p>

            {/* Add more */}
            <div style={{
              display: 'flex', gap: '10px',
              justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px'
            }}>
              <Link href="/football" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#0f1f33', border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e', padding: '9px 18px', borderRadius: '10px',
                fontWeight: 700, fontSize: '12px', textDecoration: 'none'
              }}>
                <TrendingUp size={13} /> Add Football
              </Link>
              <Link href="/aviator" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#0f1f33', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', padding: '9px 18px', borderRadius: '10px',
                fontWeight: 700, fontSize: '12px', textDecoration: 'none'
              }}>
                <Zap size={13} /> Add Aviator
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
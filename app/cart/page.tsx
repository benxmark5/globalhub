"use client";
import { useCart } from '../lib/cart';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  ShoppingCart, Trash2, Trophy,
  ArrowLeft, TrendingUp, Zap
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const [user, setUser] = useState<{
    id: string; email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const amountKES = Math.ceil(total * 130);

  const handleCheckout = async () => {
    if (!user) {
      // Save cart intent and redirect to login
      localStorage.setItem('cartCheckout', 'true');
      window.location.href = '/login';
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const footballItems = items.filter(
        i => i.type === 'football'
      );
      const aviatorItems = items.filter(
        i => i.type === 'aviator'
      );

      // Determine primary type
      const primaryType = footballItems.length >=
        aviatorItems.length ? 'football' : 'aviator';

      const label = [
        footballItems.length > 0
          ? `${footballItems.length} Football Signal${footballItems.length > 1 ? 's' : ''}`
          : null,
        aviatorItems.length > 0
          ? `${aviatorItems.length} Aviator Signal${aviatorItems.length > 1 ? 's' : ''}`
          : null,
      ].filter(Boolean).join(' + ');

      // Store cart for checkout
      localStorage.setItem('cartItems', JSON.stringify(items));
      localStorage.setItem('selectedPlan', JSON.stringify({
        type: primaryType,
        index: 0,
        price: total,
        cartItems: items,
        cartLabel: label,
        signalsCount: items.length,
        isCart: true,
      }));

      window.location.href = '/checkout';
    } catch (e) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      fontFamily: '-apple-system, sans-serif', color: 'white'
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,22,40,0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '56px'
        }}>
          <Link href="/football" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            textDecoration: 'none', color: '#9ca3af'
          }}>
            <ArrowLeft size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              Back
            </span>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShoppingCart size={18} color="#22c55e" />
            <span style={{ fontWeight: 900, fontSize: '15px' }}>
              My Cart ({items.length})
            </span>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              style={{
                background: 'none', border: 'none',
                color: '#f87171', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700,
                touchAction: 'manipulation'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{
        maxWidth: '600px', margin: '0 auto', padding: '20px 16px'
      }}>

        {/* Empty Cart */}
        {items.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#0f1f33', borderRadius: '20px',
            border: '1px solid #1a2740'
          }}>
            <ShoppingCart size={48} color="#374151"
              style={{ margin: '0 auto 16px' }} />
            <h3 style={{
              fontWeight: 900, fontSize: '20px',
              marginBottom: '10px'
            }}>
              Your cart is empty
            </h3>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              marginBottom: '24px'
            }}>
              Add signals from Football or Aviator pages
            </p>
            <div style={{
              display: 'flex', gap: '10px',
              justifyContent: 'center', flexWrap: 'wrap'
            }}>
              <Link href="/football" style={{
                background: '#22c55e', color: 'black',
                padding: '12px 24px', borderRadius: '10px',
                fontWeight: 900, fontSize: '14px',
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <TrendingUp size={16} />
                Football
              </Link>
              <Link href="/aviator" style={{
                background: '#ef4444', color: 'white',
                padding: '12px 24px', borderRadius: '10px',
                fontWeight: 900, fontSize: '14px',
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Zap size={16} />
                Aviator
              </Link>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              marginBottom: '20px'
            }}>
              {items.map(item => (
                <div key={item.id} style={{
                  background: '#0f1f33',
                  border: '1px solid #1a2740',
                  borderRadius: '14px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    flex: 1, minWidth: 0
                  }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: item.type === 'football'
                        ? 'rgba(34,197,94,0.1)'
                        : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${item.type === 'football'
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)'}`,
                      borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {item.type === 'football' ? '⚽' : '✈️'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontWeight: 700, fontSize: '14px',
                        marginBottom: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.home && item.away
                          ? `${item.home} vs ${item.away}`
                          : item.name
                        }
                      </p>
                      <p style={{
                        color: '#6b7280', fontSize: '12px'
                      }}>
                        {item.league || item.type}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', flexShrink: 0
                  }}>
                    <span style={{
                      fontWeight: 900, fontSize: '15px',
                      fontFamily: 'monospace', color: '#22c55e'
                    }}>
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', cursor: 'pointer',
                        padding: '6px', borderRadius: '8px',
                        touchAction: 'manipulation',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              background: '#0f1f33', border: '1px solid #1a2740',
              borderRadius: '16px', padding: '20px',
              marginBottom: '16px'
            }}>
              <p style={{
                color: '#6b7280', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '14px'
              }}>
                Order Summary
              </p>

              {/* Breakdown */}
              {(() => {
                const fb = items.filter(i => i.type === 'football');
                const av = items.filter(i => i.type === 'aviator');
                return (
                  <>
                    {fb.length > 0 && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          color: '#9ca3af', fontSize: '14px'
                        }}>
                          ⚽ {fb.length} Football Signal{fb.length > 1 ? 's' : ''}
                          <span style={{
                            color: '#6b7280', fontSize: '12px',
                            marginLeft: '6px'
                          }}>
                            × $1.20
                          </span>
                        </span>
                        <span style={{
                          color: 'white', fontSize: '14px',
                          fontWeight: 700
                        }}>
                          ${(fb.length * 1.20).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {av.length > 0 && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          color: '#9ca3af', fontSize: '14px'
                        }}>
                          ✈️ {av.length} Aviator Signal{av.length > 1 ? 's' : ''}
                          <span style={{
                            color: '#6b7280', fontSize: '12px',
                            marginLeft: '6px'
                          }}>
                            × $3.00
                          </span>
                        </span>
                        <span style={{
                          color: 'white', fontSize: '14px',
                          fontWeight: 700
                        }}>
                          ${(av.length * 3).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}

              <div style={{
                borderTop: '1px solid #1a2740',
                paddingTop: '12px', marginTop: '8px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 900, fontSize: '16px' }}>
                  Total
                </span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontWeight: 900, fontSize: '22px',
                    fontFamily: 'monospace', color: '#22c55e'
                  }}>
                    KES {amountKES.toLocaleString()}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>
                    ≈ ${total.toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>

            {/* Savings note */}
            {items.length >= 3 && (
              <div style={{
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '12px', padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex', gap: '10px', alignItems: 'center'
              }}>
                <span style={{ fontSize: '18px' }}>🎁</span>
                <p style={{
                  color: '#fde68a', fontSize: '13px'
                }}>
                  You're saving money by buying {items.length} signals at once vs paying separately!
                </p>
              </div>
            )}

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

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#374151' : '#22c55e',
                color: loading ? '#6b7280' : 'black',
                border: 'none', borderRadius: '16px',
                padding: '20px', fontSize: '18px', fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                touchAction: 'manipulation', display: 'block',
                boxShadow: loading
                  ? 'none'
                  : '0 8px 25px rgba(34,197,94,0.35)',
                marginBottom: '12px'
              }}
            >
              {loading
                ? '⏳ Processing...'
                : `💳 Pay KES ${amountKES.toLocaleString()} via Paystack`
              }
            </button>

            <p style={{
              textAlign: 'center', color: '#374151',
              fontSize: '12px'
            }}>
              🔒 Secure · All {items.length} signals unlock after payment
            </p>
          </>
        )}

        {/* Add more */}
        {items.length > 0 && (
          <div style={{
            marginTop: '20px', display: 'flex', gap: '10px',
            justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <Link href="/football" style={{
              background: '#0f1f33',
              border: '1px solid #22c55e',
              color: '#22c55e', padding: '10px 20px',
              borderRadius: '10px', fontWeight: 700,
              fontSize: '13px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <TrendingUp size={14} />
              Add Football
            </Link>
            <Link href="/aviator" style={{
              background: '#0f1f33',
              border: '1px solid #ef4444',
              color: '#f87171', padding: '10px 20px',
              borderRadius: '10px', fontWeight: 700,
              fontSize: '13px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Zap size={14} />
              Add Aviator
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
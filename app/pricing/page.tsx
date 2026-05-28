"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy, TrendingUp, Zap,
  CheckCircle, ArrowRight, Gift
} from 'lucide-react';

const footballPlans = [
  { games: 1, price: 1.20, label: '1 Game', 
    bonus: 0, tag: null },
  { games: 2, price: 2.40, label: '2 Games', 
    bonus: 0, tag: null },
  { games: 3, price: 4.00, label: '3 Games', 
    bonus: 0, tag: 'Popular' },
  { games: 5, price: 6.00, label: '5 Games', 
    bonus: 0, tag: null },
  { games: 8, price: 9.00, label: '8 Games', 
    bonus: 0, tag: 'Best Value' },
  { games: 10, price: 12.00, label: '10 Games', 
    bonus: 0, tag: null },
  { games: 15, price: 18.00, label: '15 Games', 
    bonus: 0, tag: null },
  { games: 20, price: 25.00, label: '20 Games', 
    bonus: 0, tag: null },
  { games: 30, price: 35.00, label: '30 Games', 
    bonus: 0, tag: null },
  { games: 50, price: 55.00, label: '50 Games', 
    bonus: 2, tag: '+2 Free!' },
  { games: 75, price: 75.00, label: '75 Games', 
    bonus: 2, tag: '+2 Free!' },
  { games: 100, price: 100.00, label: '100 Games', 
    bonus: 2, tag: '+2 Free! 🔥' },
];

const aviatorPlans = [
  { 
    tier: 'NORMAL', signals: 4, price: 10,
    color: '#6b7280', border: '#374151',
    glow: 'rgba(107,114,128,0.1)',
    features: [
      '4 Aviator signals',
      'Entry points',
      'Valid for today',
      'Email receipt',
    ]
  },
  { 
    tier: 'VIP', signals: 8, price: 18,
    color: '#fbbf24', border: '#92400e',
    glow: 'rgba(251,191,36,0.1)',
    features: [
      '8 Aviator signals',
      'Entry & Exit points',
      'Confidence rating',
      'Priority delivery',
      'Email receipt',
    ]
  },
  { 
    tier: 'VVIP', signals: 12, price: 25,
    color: '#a78bfa', border: '#4c1d95',
    glow: 'rgba(167,139,250,0.1)',
    features: [
      '12 Aviator signals',
      'Entry & Exit points',
      'Full analysis notes',
      'WhatsApp delivery',
      'Email receipt',
      'Bonus 2 extra signals',
    ]
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'football' | 'aviator'>(
    'football'
  );
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (price: number, index: number) => {
    setSelected(index);
    // Store selection and go to payment
    localStorage.setItem('selectedPlan', JSON.stringify({
      type: tab,
      index,
      price,
    }));
    router.push('/checkout');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a1628',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: 'white'
    }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,22,40,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '58px'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '9px', textDecoration: 'none'
          }}>
            <div style={{
              width: '34px', height: '34px',
              background: '#22c55e', borderRadius: '9px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={16} color="black" />
            </div>
            <span style={{
              fontWeight: 900, fontSize: '18px',
              letterSpacing: '-0.5px', color: 'white'
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <Link href="/login" style={{
            background: '#22c55e', color: 'black',
            textDecoration: 'none', fontWeight: 900,
            padding: '8px 16px', borderRadius: '9px',
            fontSize: '13px'
          }}>
            Login
          </Link>
        </div>
      </nav>

      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 16px 60px'
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: '32px'
        }}>
          <h1 style={{
            fontWeight: 900,
            fontSize: 'clamp(26px, 5vw, 40px)',
            letterSpacing: '-1px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            Buy Signals Today
          </h1>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            lineHeight: 1.6
          }}>
            Pay once · Unlock instantly · 
            Email receipt sent automatically
          </p>
        </div>

        {/* Tab Switch */}
        <div style={{
          display: 'flex',
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '28px'
        }}>
          {[
            { key: 'football', label: '⚽ Football Signals' },
            { key: 'aviator', label: '✈️ Aviator Signals' },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key as 'football' | 'aviator');
                setSelected(null);
              }}
              style={{
                flex: 1, padding: '12px 8px',
                borderRadius: '10px', border: 'none',
                fontWeight: 900, fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: tab === t.key
                  ? '#22c55e' : 'transparent',
                color: tab === t.key ? 'black' : '#6b7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Football Plans */}
        {tab === 'football' && (
          <div>
            <div style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '12px', padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex', alignItems: 'center',
              gap: '10px'
            }}>
              <Gift size={18} color="#22c55e" />
              <p style={{
                color: '#86efac', fontSize: '13px',
                lineHeight: 1.5
              }}>
                <strong>Bonus:</strong> Get 2 FREE extra games 
                when you buy 50+ games! 🎁
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {footballPlans.map((plan, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(plan.price, i)}
                  style={{
                    background: selected === i
                      ? 'rgba(34,197,94,0.15)'
                      : '#0f1f33',
                    border: selected === i
                      ? '2px solid #22c55e'
                      : '1px solid #1a2740',
                    borderRadius: '14px',
                    padding: '16px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                >
                  {plan.tag && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px', right: '10px',
                      background: plan.bonus > 0
                        ? '#f59e0b' : '#22c55e',
                      color: 'black',
                      fontSize: '10px', fontWeight: 900,
                      padding: '3px 8px',
                      borderRadius: '20px'
                    }}>
                      {plan.tag}
                    </div>
                  )}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', marginBottom: '6px'
                  }}>
                    <TrendingUp size={14} color="#22c55e" />
                    <span style={{
                      fontWeight: 900, fontSize: '14px'
                    }}>
                      {plan.label}
                    </span>
                    {plan.bonus > 0 && (
                      <span style={{
                        fontSize: '11px',
                        color: '#fbbf24', fontWeight: 700
                      }}>
                        +{plan.bonus} free
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontWeight: 900, fontFamily: 'monospace',
                    fontSize: '20px', color: '#22c55e'
                  }}>
                    ${plan.price.toFixed(2)}
                  </div>
                  <div style={{
                    color: '#6b7280', fontSize: '11px',
                    marginTop: '3px'
                  }}>
                    ${(plan.price / plan.games).toFixed(2)} per game
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div style={{
              marginTop: '20px', textAlign: 'center'
            }}>
              <p style={{
                color: '#6b7280', fontSize: '13px',
                marginBottom: '12px'
              }}>
                Select a package above to continue
              </p>
              <Link href="/football" style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '6px', color: '#22c55e',
                fontSize: '13px', fontWeight: 700,
                textDecoration: 'none'
              }}>
                View today's football signals
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Aviator Plans */}
        {tab === 'aviator' && (
          <div>
            <div style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '12px', padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex', alignItems: 'center',
              gap: '10px'
            }}>
              <Zap size={18} color="#f87171" />
              <p style={{
                color: '#fca5a5', fontSize: '13px',
                lineHeight: 1.5
              }}>
                <strong>Single signal:</strong> $3 · 
                Choose a bundle below for better value!
              </p>
            </div>

            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: '14px'
            }}>
              {aviatorPlans.map((plan, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(plan.price, i + 100)}
                  style={{
                    background: plan.glow,
                    border: `2px solid ${
                      selected === i + 100
                        ? plan.color
                        : plan.border
                    }`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'white',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '14px'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 900, fontSize: '18px',
                        color: plan.color, marginBottom: '4px',
                        textTransform: 'uppercase' as const
                      }}>
                        {plan.tier}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'baseline',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontWeight: 900, fontSize: '28px',
                          fontFamily: 'monospace', color: 'white'
                        }}>
                          ${plan.price}
                        </span>
                        <span style={{
                          color: '#6b7280', fontSize: '13px'
                        }}>
                          / {plan.signals} signals
                        </span>
                      </div>
                      <div style={{
                        color: '#6b7280', fontSize: '11px',
                        marginTop: '2px'
                      }}>
                        ${(plan.price / plan.signals).toFixed(2)} per signal
                      </div>
                    </div>
                    <div style={{
                      background: plan.color,
                      color: 'black', fontWeight: 900,
                      fontSize: '11px', padding: '5px 12px',
                      borderRadius: '20px'
                    }}>
                      {plan.signals} signals
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    {plan.features.map(f => (
                      <div key={f} style={{
                        display: 'flex',
                        alignItems: 'center', gap: '6px'
                      }}>
                        <CheckCircle size={12}
                          color="#22c55e" />
                        <span style={{
                          color: '#d1d5db',
                          fontSize: '12px'
                        }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}

              {/* Single signal option */}
              <button
                type="button"
                onClick={() => handleSelect(3, 200)}
                style={{
                  background: '#0f1f33',
                  border: selected === 200
                    ? '2px solid #22c55e'
                    : '1px solid #1a2740',
                  borderRadius: '14px', padding: '16px',
                  cursor: 'pointer', textAlign: 'left',
                  color: 'white', transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{
                    fontWeight: 900, fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    ✈️ Single Aviator Signal
                  </div>
                  <div style={{
                    color: '#6b7280', fontSize: '12px'
                  }}>
                    1 signal with entry point
                  </div>
                </div>
                <div style={{
                  fontWeight: 900, fontSize: '22px',
                  fontFamily: 'monospace', color: '#22c55e'
                }}>
                  $3
                </div>
              </button>
            </div>

            <div style={{
              marginTop: '20px', textAlign: 'center'
            }}>
              <Link href="/aviator" style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '6px', color: '#f87171',
                fontSize: '13px', fontWeight: 700,
                textDecoration: 'none'
              }}>
                View today's aviator signals
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Footer note */}
      <div style={{
        background: '#0f1f33',
        borderTop: '1px solid #1a2740',
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#374151', fontSize: '12px',
          lineHeight: 1.7
        }}>
          📧 Email receipt sent automatically after payment<br />
          💳 M-Pesa · Visa · Mastercard · Mobile Money<br />
          ✅ Signals unlocked instantly after payment
        </p>
      </div>

    </div>
  );
}
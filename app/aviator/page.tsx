"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Zap, Lock, Eye,
  Clock, AlertTriangle, ShoppingCart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';

type Signal = {
  id: string;
  entry_point: number;
  exit_point: number;
  confidence: number;
  signal_notes: string;
  price: number;
  created_at: string;
  expires_at: string; // Added to handle expiration tracking
  is_live: boolean;
};

// Expiry Timer Component for live signal cards
function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('No Limit');
      return;
    }
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    };
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const isUrgent =
    new Date(expiresAt).getTime() - Date.now() < 5 * 60000;

  return (
    <span style={{
      color: isUrgent ? '#f87171' : '#fbbf24',
      fontSize: '12px', fontWeight: 900,
      fontFamily: 'monospace',
      background: isUrgent
        ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
      border: isUrgent
        ? '1px solid rgba(239,68,68,0.2)'
        : '1px solid rgba(251,191,36,0.2)',
      padding: '3px 8px', borderRadius: '6px'
    }}>
      ⏱ {timeLeft}
    </span>
  );
}

export default function AviatorPublicPage() {
  const { addItem, isInCart, count: cartCount } = useCart();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);

      // Get only admin-dispatched aviator signals
      const { data } = await supabase
  .from('markets')
  .select('*')
  .eq('is_live', true)
  .eq('league_name', 'AVIATOR')
  .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
  .order('created_at', { ascending: false });

      setSignals(data || []);

      // Check purchases
      if (user) {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('market_id, signal_type, status')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .eq('signal_type', 'aviator')
          .gt('expires_at', new Date().toISOString());

        if (purchases) {
          setUnlockedIds(
            purchases.map(p => p.market_id).filter(Boolean)
          );
        }
      }

      setLoading(false);
    };
    init();
  }, []);

  const isUnlocked = (id: string) => unlockedIds.includes(id);

  const getRisk = (entry: number, exit: number) => {
    const diff = exit - entry;
    if (diff <= 1) return { label: 'LOW RISK', color: '#22c55e' };
    if (diff <= 3) return { label: 'MEDIUM RISK', color: '#fbbf24' };
    return { label: 'HIGH RISK', color: '#f87171' };
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0a1628',
      fontFamily: '-apple-system, sans-serif', color: 'white'
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,22,40,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '56px'
        }}>
          <Link href="/" style={{
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
            <Zap size={18} color="#f87171" />
            <span style={{ fontWeight: 900, fontSize: '15px' }}>
              Aviator Signals
            </span>
          </div>
          {user ? (
            <Link href="/account" style={{
              color: '#22c55e', fontSize: '12px',
              fontWeight: 700, textDecoration: 'none'
            }}>
              Account
            </Link>
          ) : (
            <Link href="/login" style={{
              background: '#22c55e', color: 'black',
              padding: '7px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 900,
              textDecoration: 'none'
            }}>
              Login
            </Link>
          )}
        </div>
      </div>

      <div style={{
        maxWidth: '700px', margin: '0 auto', padding: '20px 16px'
      }}>

        {/* Warning */}
        <div style={{
          background: 'rgba(251,191,36,0.06)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '14px', padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'flex-start', gap: '10px'
        }}>
          <AlertTriangle size={18} color="#fbbf24"
            style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{
            color: '#fde68a', fontSize: '13px', lineHeight: 1.6
          }}>
            Signals are based on pattern analysis by our experts.
            Always play responsibly and never risk more than
            you can afford to lose.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                background: '#0f1f33', borderRadius: '16px',
                height: '200px', opacity: 0.5
              }} />
            ))}
          </div>
        )}

        {/* No signals */}
        {!loading && signals.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#0f1f33', borderRadius: '20px',
            border: '1px solid #1a2740'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              ✈️
            </div>
            <h3 style={{
              fontWeight: 900, fontSize: '20px',
              marginBottom: '10px'
            }}>
              No Signals Yet Today
            </h3>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              lineHeight: 1.6, marginBottom: '20px',
              maxWidth: '300px', margin: '0 auto 20px'
            }}>
              Our analyst is preparing today's Aviator signals.
              Check back soon!
            </p>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              color: '#374151', fontSize: '13px'
            }}>
              <Clock size={14} />
              Signals are usually posted in the morning
            </div>
          </div>
        )}

        {/* Signals */}
        {!loading && signals.length > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            {signals.map(signal => {
              const unlocked = isUnlocked(signal.id);
              const risk = getRisk(
                signal.entry_point || 1,
                signal.exit_point || 2
              );

              return (
                <div key={signal.id} style={{
                  background: '#0f1f33',
                  border: '1px solid #1a2740',
                  borderRadius: '18px', overflow: 'hidden'
                }}>
                  {/* Risk header */}
                  <div style={{
                    background: '#060f1e',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #1a2740'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 900,
                        textTransform: 'uppercase',
                        color: risk.color, letterSpacing: '0.05em'
                      }}>
                        {risk.label}
                      </span>
                      {/* Integrated Expiry Countdown Timer for each card */}
                      <ExpiryTimer expiresAt={signal.expires_at} />
                    </div>
                    
                    {unlocked ? (
                      <span style={{
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e', fontSize: '10px',
                        fontWeight: 700, padding: '3px 10px',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Eye size={10} /> UNLOCKED
                      </span>
                    ) : (
                      <span style={{
                        color: '#6b7280', fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {new Date(signal.created_at)
                          .toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                          })}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '18px' }}>
                    {/* Entry/Exit — locked or shown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px', marginBottom: '14px'
                    }}>
                      <div style={{
                        background: unlocked
                          ? 'rgba(34,197,94,0.08)'
                          : '#0a1628',
                        border: unlocked
                          ? '1px solid rgba(34,197,94,0.2)'
                          : '1px solid #1a2740',
                        borderRadius: '12px', padding: '14px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          color: '#6b7280', fontSize: '10px',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                          letterSpacing: '0.08em'
                        }}>
                          🟢 Enter At
                        </p>
                        {unlocked ? (
                          <p style={{
                            fontWeight: 900, fontSize: '28px',
                            fontFamily: 'monospace',
                            color: '#22c55e'
                          }}>
                            {signal.entry_point}x
                          </p>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '5px'
                          }}>
                            <Lock size={12} color="#374151" />
                            <span style={{
                              color: '#374151', fontSize: '22px',
                              fontFamily: 'monospace', fontWeight: 900
                            }}>
                              ??.??x
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{
                        background: unlocked
                          ? 'rgba(239,68,68,0.08)'
                          : '#0a1628',
                        border: unlocked
                          ? '1px solid rgba(239,68,68,0.2)'
                          : '1px solid #1a2740',
                        borderRadius: '12px', padding: '14px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          color: '#6b7280', fontSize: '10px',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                          letterSpacing: '0.08em'
                        }}>
                          🔴 Exit At
                        </p>
                        {unlocked ? (
                          <p style={{
                            fontWeight: 900, fontSize: '28px',
                            fontFamily: 'monospace',
                            color: '#f87171'
                          }}>
                            {signal.exit_point}x
                          </p>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '5px'
                          }}>
                            <Lock size={12} color="#374151" />
                            <span style={{
                              color: '#374151', fontSize: '22px',
                              fontFamily: 'monospace', fontWeight: 900
                            }}>
                              ??.??x
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {unlocked && (
                      <div style={{
                        background: '#0a1628',
                        border: '1px solid #1a2740',
                        borderRadius: '10px', padding: '12px 14px',
                        marginBottom: '14px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            color: '#6b7280', fontSize: '10px',
                            marginBottom: '4px'
                          }}>
                            Profit Potential
                          </p>
                          <p style={{
                            color: '#22c55e', fontWeight: 900,
                            fontSize: '15px'
                          }}>
                            +{((signal.exit_point /
                              signal.entry_point - 1) * 100)
                              .toFixed(0)}%
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            color: '#6b7280', fontSize: '10px',
                            marginBottom: '4px'
                          }}>
                            Confidence
                          </p>
                          <p style={{
                            color: '#fbbf24', fontWeight: 900,
                            fontSize: '15px'
                          }}>
                            {signal.confidence}%
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            color: '#6b7280', fontSize: '10px',
                            marginBottom: '4px'
                          }}>
                            Risk
                          </p>
                          <p style={{
                            color: risk.color, fontWeight: 900,
                            fontSize: '13px'
                          }}>
                            {risk.label.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Notes if unlocked */}
                    {unlocked && signal.signal_notes && (
                      <div style={{
                        background: 'rgba(34,197,94,0.05)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        marginBottom: '14px'
                      }}>
                        <p style={{
                          color: '#86efac', fontSize: '13px',
                          lineHeight: 1.6
                        }}>
                          📋 {signal.signal_notes}
                        </p>
                      </div>
                    )}

                    {/* Action Block */}
                    {unlocked ? (
                      <div style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '12px', padding: '14px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          color: '#22c55e', fontWeight: 700,
                          fontSize: '15px'
                        }}>
                          ✅ Signal Active — Valid 24hrs
                        </p>
                      </div>
                    ) : isInCart(signal.id) ? (
                      <div style={{
                        display: 'flex', gap: '8px'
                      }}>
                        <div style={{
                          flex: 1, background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '12px', padding: '14px',
                          textAlign: 'center'
                        }}>
                          <p style={{
                            color: '#22c55e', fontWeight: 700, fontSize: '14px'
                          }}>
                            ✅ Added to cart
                          </p>
                        </div>
                        <Link href="/cart" style={{
                          background: '#ef4444', color: 'white',
                          padding: '14px 20px', borderRadius: '12px',
                          fontWeight: 900, fontSize: '13px',
                          textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <ShoppingCart size={16} />
                          Cart ({cartCount})
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            window.location.href = '/login';
                            return;
                          }
                          addItem({
                            id: signal.id,
                            type: 'aviator',
                            name: `Aviator Signal`,
                            price: 3.00,
                            league: 'AVIATOR',
                          });
                        }}
                        style={{
                          width: '100%', background: '#ef4444',
                          color: 'white', border: 'none',
                          borderRadius: '12px', padding: '15px',
                          fontSize: '15px', fontWeight: 900,
                          cursor: 'pointer', touchAction: 'manipulation',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px'
                        }}
                      >
                        <ShoppingCart size={18} />
                        Add to Cart — $3.00
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Buy more CTA */}
        {!loading && (
          <div style={{
            marginTop: '20px', background: '#0f1f33',
            border: '1px solid #1a2740',
            borderRadius: '16px', padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              fontWeight: 700, fontSize: '14px', marginBottom: '6px'
            }}>
              Want more Aviator signals?
            </p>
            <p style={{
              color: '#6b7280', fontSize: '13px', marginBottom: '14px'
            }}>
              Single signal from $3 · Bundle of 4 for $10
            </p>
            <Link href="/pricing" style={{
              display: 'inline-block',
              background: '#ef4444', color: 'white',
              padding: '12px 28px', borderRadius: '10px',
              fontWeight: 900, fontSize: '14px',
              textDecoration: 'none'
            }}>
              View Aviator Pricing →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
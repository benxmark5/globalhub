"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft, Lock, Eye,
  Trophy, RefreshCw, ShoppingCart
} from 'lucide-react';
import { useCart } from '../lib/cart';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Market = {
  id: string;
  name: string;
  odds: number;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  analysis_notes: string;
  daily_price: number;  // ← this now varies by tier
  tier: string;          // ← added tier
  league_name: string;
  home_team: string;
  away_team: string;
  is_live: boolean;
  created_at: string;
};

type User = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

export default function FootballPage() {
  const { addItem, isInCart, count: cartCount } = useCart();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasActivePurchase, setHasActivePurchase] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    const { data: { session } } = await supabase.auth.getSession();
const user = session?.user ?? null;

    // Only load admin-pushed markets
    const { data: marketData } = await supabase
      .from('markets')
      .select('*')
      .eq('is_live', true)
      .not('league_name', 'eq', 'AVIATOR')
      .order('created_at', { ascending: false });

    setMarkets(marketData || []);

    if (user) {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('market_id, signal_type, signals_count, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gt('expires_at', new Date().toISOString());

      if (purchases && purchases.length > 0) {
        setHasActivePurchase(true);
        const footballPurchases = purchases.filter(
          p => p.signal_type === 'football'
        );
        const totalSignals = footballPurchases.reduce(
          (sum, p) => sum + (p.signals_count || 1), 0
        );
        const marketIds = (marketData || [])
          .slice(0, totalSignals)
          .map(m => m.id);
        setUnlockedIds(marketIds);
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 120000);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = (id: string) => unlockedIds.includes(id);

  const handleBuySignals = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    localStorage.setItem('selectedPlan', JSON.stringify({
      type: 'football',
      index: 0,
      price: 1.20,
    }));
    window.location.href = '/checkout';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

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
          maxWidth: '700px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '56px'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '6px', textDecoration: 'none', color: '#9ca3af'
          }}>
            <ArrowLeft size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              Back
            </span>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Trophy size={18} color="#22c55e" />
            <span style={{ fontWeight: 900, fontSize: '15px' }}>
              Football Signals
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => loadData(true)}
              style={{
                background: 'none', border: 'none',
                color: '#6b7280', cursor: 'pointer',
                padding: '4px', touchAction: 'manipulation'
              }}
            >
              <RefreshCw size={16} style={{
                animation: refreshing
                  ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
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
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        maxWidth: '700px', margin: '0 auto', padding: '20px 16px'
      }}>

        {/* Date Banner */}
        <div style={{
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '14px', padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '8px'
        }}>
          <div>
            <p style={{
              color: '#6b7280', fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '3px'
            }}>
              Today's Signals
            </p>
            <p style={{ fontWeight: 900, fontSize: '15px' }}>
              📅 {today}
            </p>
          </div>
          {markets.length > 0 && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px', padding: '8px 14px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#22c55e', fontWeight: 900,
                fontSize: '20px', fontFamily: 'monospace'
              }}>
                {markets.length}
              </p>
              <p style={{
                color: '#6b7280', fontSize: '10px',
                textTransform: 'uppercase'
              }}>
                {markets.length === 1 ? 'Signal' : 'Signals'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Cart Button (After Date Banner) */}
        {cartCount > 0 && (
          <Link href="/cart" style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            background: '#22c55e', color: 'black',
            borderRadius: '14px', padding: '14px 18px',
            marginBottom: '16px', textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <ShoppingCart size={20} />
              <div>
                <p style={{ fontWeight: 900, fontSize: '15px' }}>
                  {cartCount} signal{cartCount > 1 ? 's' : ''} in cart
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>
                  Tap to checkout
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 900, fontSize: '16px' }}>
                KES {Math.ceil(cartCount * 1.20 * 130).toLocaleString()}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8 }}>
                Pay now →
              </p>
            </div>
          </Link>
        )}

        {/* Active purchase notice */}
        {hasActivePurchase && unlockedIds.length > 0 && (
          <div style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <p style={{ color: '#86efac', fontSize: '13px' }}>
              <strong>
                {unlockedIds.length} signal{unlockedIds.length > 1 ? 's' : ''}
              </strong> unlocked and active today
            </p>
          </div>
        )}

        {/* Not logged in */}
        {!user && (
          <div style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '12px', padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px', flexWrap: 'wrap'
          }}>
            <p style={{ color: '#fde68a', fontSize: '13px' }}>
              🔐 Login to purchase and unlock signals
            </p>
            <Link href="/login" style={{
              background: '#fbbf24', color: 'black',
              padding: '8px 16px', borderRadius: '8px',
              fontSize: '12px', fontWeight: 900,
              textDecoration: 'none', flexShrink: 0
            }}>
              Login Now
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#0f1f33', borderRadius: '16px',
                height: '180px', opacity: 0.4
              }} />
            ))}
          </div>
        )}

        {/* No signals */}
        {!loading && markets.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '50px 20px',
            background: '#0f1f33', borderRadius: '20px',
            border: '1px solid #1a2740'
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>
              ⚽
            </div>
            <h3 style={{
              fontWeight: 900, fontSize: '20px',
              marginBottom: '10px'
            }}>
              Signals Coming Soon!
            </h3>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              lineHeight: 1.7, maxWidth: '280px',
              margin: '0 auto 20px'
            }}>
              Our analysts are reviewing today's matches.
              Check back soon!
            </p>
            <button
              type="button"
              onClick={() => loadData(true)}
              style={{
                background: '#22c55e', color: 'black',
                border: 'none', padding: '12px 24px',
                borderRadius: '10px', fontWeight: 900,
                fontSize: '14px', cursor: 'pointer',
                touchAction: 'manipulation',
                display: 'inline-flex', alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Check Again
            </button>
          </div>
        )}

        {/* Markets — Admin pushed only */}
        {!loading && markets.length > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            {markets.map((market, idx) => {
              const unlocked = isUnlocked(market.id);
              return (
                <div key={market.id} style={{
                  background: '#0f1f33',
                  border: unlocked
                    ? '2px solid rgba(34,197,94,0.4)'
                    : '1px solid #1a2740',
                  borderRadius: '18px', overflow: 'hidden'
                }}>

                  {/* League header */}
                  <div style={{
                    background: '#060f1e', padding: '10px 16px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #1a2740'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: '14px' }}>⚽</span>
                      <span style={{
                        color: '#22c55e', fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {market.league_name}
                      </span>
                      
                      {/* Tier Badge Added Here */}
                      <span style={{
                        background: market.tier === 'super'
                          ? 'rgba(167,139,250,0.15)'
                          : market.tier === 'big'
                          ? 'rgba(251,191,36,0.15)'
                          : '#1a2740',
                        color: market.tier === 'super'
                          ? '#a78bfa'
                          : market.tier === 'big'
                          ? '#fbbf24'
                          : '#6b7280',
                        fontSize: '10px', fontWeight: 900,
                        padding: '2px 8px', borderRadius: '20px',
                        textTransform: 'uppercase'
                      }}>
                        {market.tier === 'super' ? '🔥 SUPER'
                          : market.tier === 'big' ? '⭐ BIG GAME'
                          : 'NORMAL'
                        }
                      </span>

                      <span style={{
                        background: '#1a2740', color: '#6b7280',
                        fontSize: '10px', padding: '2px 8px',
                        borderRadius: '20px', fontWeight: 700
                      }}>
                        #{idx + 1}
                      </span>
                    </div>
                    {unlocked ? (
                      <span style={{
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e', fontSize: '10px',
                        fontWeight: 700, padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Eye size={10} /> UNLOCKED
                      </span>
                    ) : (
                      <span style={{
                        background: '#1a2740', color: '#6b7280',
                        fontSize: '10px', fontWeight: 700,
                        padding: '4px 10px', borderRadius: '20px',
                        display: 'flex', alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Lock size={10} /> LOCKED
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '18px' }}>

                    {/* Teams */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{
                          fontWeight: 900, fontSize: '17px',
                          lineHeight: 1.2
                        }}>
                          {market.home_team}
                        </p>
                        <p style={{
                          color: '#6b7280', fontSize: '10px',
                          marginTop: '3px', textTransform: 'uppercase'
                        }}>
                          Home
                        </p>
                      </div>
                      <div style={{
                        background: '#0a1628',
                        border: '1px solid #1a2740',
                        borderRadius: '8px', padding: '6px 12px',
                        margin: '0 10px'
                      }}>
                        <span style={{
                          color: '#374151', fontWeight: 900,
                          fontSize: '13px'
                        }}>
                          VS
                        </span>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{
                          fontWeight: 900, fontSize: '17px',
                          lineHeight: 1.2
                        }}>
                          {market.away_team}
                        </p>
                        <p style={{
                          color: '#6b7280', fontSize: '10px',
                          marginTop: '3px', textTransform: 'uppercase'
                        }}>
                          Away
                        </p>
                      </div>
                    </div>

                    {/* Odds */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px', marginBottom: '14px'
                    }}>
                      {[
                        { l: 'Home Win', v: market.home_odds },
                        { l: 'Draw', v: market.draw_odds },
                        { l: 'Away Win', v: market.away_odds },
                      ].map(odd => (
                        <div key={odd.l} style={{
                          background: '#0a1628',
                          border: '1px solid #1a2740',
                          borderRadius: '10px', padding: '10px 8px',
                          textAlign: 'center'
                        }}>
                          <p style={{
                            color: '#6b7280', fontSize: '9px',
                            textTransform: 'uppercase',
                            marginBottom: '6px', letterSpacing: '0.05em'
                          }}>
                            {odd.l}
                          </p>
                          {unlocked ? (
                            <p style={{
                              fontWeight: 900, fontSize: '18px',
                              fontFamily: 'monospace', color: '#fbbf24'
                            }}>
                              {odd.v?.toFixed(2) || '-.--'}
                            </p>
                          ) : (
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', gap: '4px'
                            }}>
                              <Lock size={10} color="#374151" />
                              <span style={{
                                color: '#374151', fontSize: '16px',
                                fontFamily: 'monospace', fontWeight: 900
                              }}>
                                ?.??
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Signal box */}
                    <div style={{
                      background: '#0a1628',
                      border: unlocked
                        ? '1px solid rgba(34,197,94,0.3)'
                        : '1px solid #1a2740',
                      borderRadius: '12px', padding: '14px',
                      marginBottom: '14px', position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {!unlocked && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(10,22,40,0.92)',
                          backdropFilter: 'blur(6px)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          zIndex: 1, gap: '6px'
                        }}>
                          <Lock size={22} color="#374151" />
                          <p style={{
                            color: '#374151', fontSize: '13px',
                            fontWeight: 700
                          }}>
                            Purchase to reveal signal
                          </p>
                        </div>
                      )}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '10px'
                      }}>
                        <span style={{
                          color: '#6b7280', fontSize: '12px'
                        }}>
                          Our Pick
                        </span>
                        <span style={{
                          color: '#22c55e', fontWeight: 900,
                          fontSize: '16px'
                        }}>
                          {unlocked
                            ? market.name?.split(' - ')[1] || 'WIN'
                            : '???'
                          }
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          color: '#6b7280', fontSize: '12px'
                        }}>
                          Odds
                        </span>
                        <span style={{
                          color: '#fbbf24', fontWeight: 900,
                          fontSize: '22px', fontFamily: 'monospace'
                        }}>
                          {unlocked
                            ? market.odds?.toFixed(2)
                            : '?.??'
                          }
                        </span>
                      </div>
                      {unlocked && market.analysis_notes && (
                        <div style={{
                          borderTop: '1px solid #1a2740',
                          paddingTop: '10px', marginTop: '10px'
                        }}>
                          <p style={{
                            color: '#6b7280', fontSize: '11px',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                          }}>
                            Analysis
                          </p>
                          <p style={{
                            color: '#9ca3af', fontSize: '13px',
                            lineHeight: 1.6
                          }}>
                            {market.analysis_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {unlocked ? (
                      <div style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '12px', padding: '14px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          color: '#22c55e', fontWeight: 900,
                          fontSize: '15px'
                        }}>
                          ✅ Signal Active — Valid 24hrs
                        </p>
                      </div>
                    ) : isInCart(market.id) ? (
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
                          background: '#22c55e', color: 'black',
                          padding: '14px 20px', borderRadius: '12px',
                          fontWeight: 900, fontSize: '13px',
                          textDecoration: 'none', whiteSpace: 'nowrap',
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
                            id: market.id,
                            type: 'football',
                            name: `${market.home_team} vs ${market.away_team}`,
                            price: market.daily_price || 2.50,
                            league: market.league_name,
                            home: market.home_team,
                            away: market.away_team,
                            tier: market.tier
                          });
                        }}
                        style={{
                          width: '100%', background: '#22c55e',
                          color: 'black', border: 'none',
                          borderRadius: '12px', padding: '16px',
                          fontSize: '15px', fontWeight: 900,
                          cursor: 'pointer', touchAction: 'manipulation',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {/* Button text updated to show dynamic tier price */}
                        <ShoppingCart size={18} />
                        Add to Cart — ${(market.daily_price || 2.50).toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Buy more */}
        {!loading && markets.length > 0 && (
          <div style={{
            marginTop: '20px', background: '#0f1f33',
            border: '1px solid #1a2740', borderRadius: '16px',
            padding: '20px', textAlign: 'center'
          }}>
            <p style={{
              fontWeight: 900, fontSize: '15px', marginBottom: '6px'
            }}>
              Want more signals?
            </p>
            <p style={{
              color: '#6b7280', fontSize: '13px',
              marginBottom: '16px'
            }}>
              Buy bundles for better value — up to 100 signals
            </p>
            <Link href="/pricing" style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '8px', background: '#22c55e', color: 'black',
              padding: '12px 28px', borderRadius: '10px',
              fontWeight: 900, fontSize: '14px',
              textDecoration: 'none'
            }}>
              View All Packages →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
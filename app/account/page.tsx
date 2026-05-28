"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy, TrendingUp, Zap,
  LogOut, User, Clock,
  CheckCircle, ShoppingBag
} from 'lucide-react';

type Purchase = {
  id: string;
  signal_type: string;
  signals_count: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  expires_at: string;
  plan: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Get recent purchases
      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPurchases(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const activePurchases = purchases.filter(p =>
    p.status === 'completed' &&
    new Date(p.expires_at) > new Date()
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a1628',
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

  return (
    <div style={{
      minHeight: '100vh', background: '#0a1628',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: 'white'
    }}>

      {/* Header */}
      <div style={{
        background: '#0f1f33',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '58px'
        }}>
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
            <span style={{
              fontWeight: 900, fontSize: '16px',
              color: 'white'
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '6px', background: 'none', border: 'none',
              color: '#6b7280', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '600px', margin: '0 auto',
        padding: '24px 16px'
      }}>

        {/* User Card */}
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '16px', padding: '20px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0
          }}>
            <User size={24} color="#22c55e" />
          </div>
          <div>
            <p style={{
              fontWeight: 900, fontSize: '18px',
              marginBottom: '3px'
            }}>
              {user?.user_metadata?.full_name || 'Welcome!'}
            </p>
            <p style={{
              color: '#6b7280', fontSize: '13px'
            }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Active Signals */}
        {activePurchases.length > 0 && (
          <div style={{
            background: 'rgba(34,197,94,0.05)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '16px', padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontWeight: 900, fontSize: '13px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em', color: '#22c55e',
              marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={15} />
              Active Signals Today
            </p>
            {activePurchases.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '10px',
                background: '#0f1f33',
                border: '1px solid #1a2740',
                borderRadius: '10px', padding: '12px 14px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{ fontSize: '18px' }}>
                    {p.signal_type === 'football' ? '⚽' : '✈️'}
                  </span>
                  <div>
                    <p style={{
                      fontWeight: 700, fontSize: '14px'
                    }}>
                      {p.signals_count}{' '}
                      {p.signal_type === 'football'
                        ? p.signals_count === 1
                          ? 'Game' : 'Games'
                        : p.signals_count === 1
                          ? 'Signal' : 'Signals'
                      }
                    </p>
                    <p style={{
                      color: '#6b7280', fontSize: '11px'
                    }}>
                      Expires:{' '}
                      {new Date(p.expires_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/${p.signal_type}`}
                  style={{
                    background: '#22c55e', color: 'black',
                    padding: '7px 14px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 900,
                    textDecoration: 'none'
                  }}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '20px'
        }}>
          <Link href="/football" style={{
            background: '#0f1f33',
            border: '1px solid #1a2740',
            borderRadius: '14px', padding: '18px',
            textDecoration: 'none', color: 'white',
            display: 'flex', flexDirection: 'column' as const,
            gap: '8px'
          }}>
            <TrendingUp color="#22c55e" size={24} />
            <p style={{ fontWeight: 900, fontSize: '14px' }}>
              Football
            </p>
            <p style={{
              color: '#6b7280', fontSize: '12px'
            }}>
              From $1.20
            </p>
          </Link>
          <Link href="/aviator" style={{
            background: '#0f1f33',
            border: '1px solid #1a2740',
            borderRadius: '14px', padding: '18px',
            textDecoration: 'none', color: 'white',
            display: 'flex', flexDirection: 'column' as const,
            gap: '8px'
          }}>
            <Zap color="#f87171" size={24} />
            <p style={{ fontWeight: 900, fontSize: '14px' }}>
              Aviator
            </p>
            <p style={{
              color: '#6b7280', fontSize: '12px'
            }}>
              From $3
            </p>
          </Link>
        </div>

        {/* Buy Signals Button */}
        <Link href="/pricing" style={{
          display: 'block', textAlign: 'center',
          background: '#22c55e', color: 'black',
          padding: '16px', borderRadius: '14px',
          fontWeight: 900, fontSize: '16px',
          textDecoration: 'none',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
        }}>
          🎯 Buy Today's Signals
        </Link>

        {/* Purchase History */}
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1a2740',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShoppingBag size={16} color="#6b7280" />
            <p style={{
              fontWeight: 700, fontSize: '13px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.06em', color: '#9ca3af'
            }}>
              Purchase History
            </p>
          </div>

          {purchases.length === 0 ? (
            <div style={{
              padding: '32px 20px', textAlign: 'center'
            }}>
              <Clock size={32} color="#374151"
                style={{ margin: '0 auto 12px' }} />
              <p style={{
                color: '#6b7280', fontSize: '14px',
                marginBottom: '16px'
              }}>
                No purchases yet
              </p>
              <Link href="/pricing" style={{
                background: '#22c55e', color: 'black',
                padding: '10px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 900,
                textDecoration: 'none'
              }}>
                Buy Your First Signal
              </Link>
            </div>
          ) : (
            <div>
              {purchases.map((p, i) => (
                <div key={p.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < purchases.length - 1
                    ? '1px solid #1a2740' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {p.signal_type === 'football' ? '⚽' : '✈️'}
                    </span>
                    <div>
                      <p style={{
                        fontWeight: 700, fontSize: '13px',
                        marginBottom: '2px'
                      }}>
                        {p.signals_count}{' '}
                        {p.signal_type === 'football'
                          ? 'Game(s)' : 'Signal(s)'
                        }
                      </p>
                      <p style={{
                        color: '#6b7280', fontSize: '11px'
                      }}>
                        {new Date(p.created_at)
                          .toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 700, fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#22c55e'
                    }}>
                      {p.currency} {p.amount?.toLocaleString()}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '10px',
                      background: p.status === 'completed'
                        ? 'rgba(34,197,94,0.1)'
                        : 'rgba(107,114,128,0.1)',
                      color: p.status === 'completed'
                        ? '#22c55e' : '#6b7280',
                      textTransform: 'uppercase' as const
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
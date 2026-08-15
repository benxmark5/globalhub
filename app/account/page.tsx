"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WalletCard from '../components/WalletCard';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import {
  Trophy, TrendingUp, Zap, LogOut,
  User, Clock, CheckCircle, ShoppingBag,
  Camera, Sun, Moon, AlertTriangle
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{
    id: string; email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'wallet' | 'history'>('overview');

  const bg = darkMode ? '#0a1628' : '#f0f4f8';
  const cardBg = darkMode ? '#0f1f33' : '#ffffff';
  const border = darkMode ? '#1a2740' : '#e2e8f0';
  const text = darkMode ? 'white' : '#1a202c';
  const subtext = darkMode ? '#9ca3af' : '#64748b';
  const mutedText = darkMode ? '#6b7280' : '#94a3b8';

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) { router.push('/login'); return; }
      setUser(user);
      setAvatarUrl(user.user_metadata?.avatar_url || null);

      const { data } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setPurchases(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setAvatarUrl(base64);

        // Save to user metadata
        await supabase.auth.updateUser({
          data: { avatar_url: base64 }
        });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Avatar upload error:', e);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const activePurchases = purchases.filter(p =>
    p.status === 'completed' &&
    new Date(p.expires_at) > new Date()
  );

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + (p.amount || 0), 0);

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', background: bg,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: mutedText, fontFamily: 'sans-serif' }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', background: bg, color: text,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      transition: 'all 0.3s'
    }}>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '20px', padding: '28px',
            maxWidth: '360px', width: '100%', textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <AlertTriangle size={26} color="#f87171" />
            </div>
            <h3 style={{
              fontWeight: 900, fontSize: '18px',
              marginBottom: '10px'
            }}>
              Log Out?
            </h3>
            <p style={{
              color: subtext, fontSize: '14px',
              lineHeight: 1.6, marginBottom: '24px'
            }}>
              Are you sure you want to log out of GlobalHub?
              You will need to log back in to access your signals.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: '12px', padding: '14px',
                  color: subtext, fontWeight: 700,
                  fontSize: '14px', cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1, background: '#ef4444',
                  border: 'none', borderRadius: '12px',
                  padding: '14px', color: 'white',
                  fontWeight: 900, fontSize: '14px',
                  cursor: 'pointer', touchAction: 'manipulation'
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: cardBg, borderBottom: `1px solid ${border}`,
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
              fontWeight: 900, fontSize: '16px', color: text
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {/* Dark/Light Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              style={{
                background: darkMode ? '#1a2740' : '#e2e8f0',
                border: `1px solid ${border}`,
                borderRadius: '10px', padding: '8px',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '5px',
                color: text, touchAction: 'manipulation'
              }}
            >
              {darkMode
                ? <Sun size={16} color="#fbbf24" />
                : <Moon size={16} color="#6366f1" />
              }
              <span style={{ fontSize: '11px', fontWeight: 700 }}>
                {darkMode ? 'Light' : 'Dark'}
              </span>
            </button>
            {/* Logout */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '5px', background: 'none',
                border: 'none', color: '#f87171',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: 700, touchAction: 'manipulation'
              }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '600px', margin: '0 auto',
        padding: '20px 16px'
      }}>

        {/* Profile Card */}
        <div style={{
          background: cardBg, border: `1px solid ${border}`,
          borderRadius: '20px', padding: '24px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '70px', height: '70px',
                borderRadius: '50%',
                border: '3px solid #22c55e',
                overflow: 'hidden',
                background: 'rgba(34,197,94,0.1)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0
              }}
                onClick={() => fileRef.current?.click()}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={70}
                    height={70}
                    unoptimized
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <User size={32} color="#22c55e" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '24px', height: '24px',
                  background: '#22c55e', borderRadius: '50%',
                  border: `2px solid ${bg}`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                  touchAction: 'manipulation'
                }}
              >
                {uploadingAvatar
                  ? <span style={{ fontSize: '10px' }}>⏳</span>
                  : <Camera size={12} color="black" />
                }
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* User Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 900, fontSize: '18px',
                marginBottom: '3px', color: text
              }}>
                {user?.user_metadata?.full_name || 'Welcome!'}
              </p>
              <p style={{
                color: subtext, fontSize: '13px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.email}
              </p>
              <p style={{
                color: mutedText, fontSize: '11px', marginTop: '4px'
              }}>
                Tap avatar to change photo
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px', marginTop: '20px',
            paddingTop: '16px', borderTop: `1px solid ${border}`
          }}>
            {[
              {
                label: 'Purchases',
                value: purchases.filter(
                  p => p.status === 'completed'
                ).length,
                color: '#22c55e'
              },
              {
                label: 'Active',
                value: activePurchases.length,
                color: '#60a5fa'
              },
              {
                label: 'Spent',
                value: totalSpent > 0
                  ? `${totalSpent.toLocaleString()}`
                  : '0',
                color: '#fbbf24'
              },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontWeight: 900, fontSize: '20px',
                  fontFamily: 'monospace', color: s.color
                }}>
                  {s.value}
                </p>
                <p style={{
                  color: mutedText, fontSize: '10px',
                  textTransform: 'uppercase'
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Signals */}
        {activePurchases.length > 0 && (
          <div style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '16px', padding: '18px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontWeight: 900, fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#22c55e',
              marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle size={15} />
              {activePurchases.length} Active Signal{activePurchases.length > 1 ? 's' : ''} Today
            </p>
            {activePurchases.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                background: cardBg,
                border: `1px solid ${border}`,
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
                      fontWeight: 700, fontSize: '14px', color: text
                    }}>
                      {p.signals_count}{' '}
                      {p.signal_type === 'football'
                        ? p.signals_count === 1 ? 'Game' : 'Games'
                        : p.signals_count === 1 ? 'Signal' : 'Signals'
                      }
                    </p>
                    <p style={{
                      color: mutedText, fontSize: '11px'
                    }}>
                      Expires:{' '}
                      {new Date(p.expires_at).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Link href={`/${p.signal_type}`} style={{
                  background: '#22c55e', color: 'black',
                  padding: '7px 14px', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 900,
                  textDecoration: 'none'
                }}>
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '16px'
        }}>
          <Link href="/football" style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '14px', padding: '18px',
            textDecoration: 'none', color: text,
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <TrendingUp color="#22c55e" size={24} />
            <p style={{ fontWeight: 900, fontSize: '14px' }}>
              Football
            </p>
            <p style={{ color: mutedText, fontSize: '12px' }}>
              From $1.20
            </p>
          </Link>
          <Link href="/aviator" style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '14px', padding: '18px',
            textDecoration: 'none', color: text,
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <Zap color="#f87171" size={24} />
            <p style={{ fontWeight: 900, fontSize: '14px' }}>
              Aviator
            </p>
            <p style={{ color: mutedText, fontSize: '12px' }}>
              From $3
            </p>
          </Link>
        </div>

        {/* Buy Signals CTA */}
        <Link href="/pricing" style={{
          display: 'block', textAlign: 'center',
          background: '#22c55e', color: 'black',
          padding: '16px', borderRadius: '14px',
          fontWeight: 900, fontSize: '16px',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
        }}>
          🎯 Buy Today&apos;s Signals
        </Link>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '1px',
          background: border, borderRadius: '12px',
          overflow: 'hidden', marginBottom: '16px'
        }}>
          {(['overview', 'wallet', 'history'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '12px',
                background: tab === t ? '#22c55e' : cardBg,
                color: tab === t ? 'black' : subtext,
                border: 'none', fontWeight: 700,
                fontSize: '13px', textTransform: 'uppercase',
                cursor: 'pointer', touchAction: 'manipulation'
              }}
            >
              {t === 'overview' ? '📊 Overview' : t === 'wallet' ? '💰 Wallet' : '📋 History'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '16px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <ShoppingBag size={16} color={mutedText} />
              <p style={{
                fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em', color: subtext
              }}>
                Signal Summary
              </p>
            </div>
            <div style={{ padding: '16px' }}>
              {[
                {
                  label: '⚽ Football Signals Bought',
                  value: purchases.filter(
                    p => p.signal_type === 'football' &&
                    p.status === 'completed'
                  ).length
                },
                {
                  label: '✈️ Aviator Signals Bought',
                  value: purchases.filter(
                    p => p.signal_type === 'aviator' &&
                    p.status === 'completed'
                  ).length
                },
                {
                  label: '✅ Total Completed',
                  value: purchases.filter(
                    p => p.status === 'completed'
                  ).length
                },
                {
                  label: '⏳ Pending',
                  value: purchases.filter(
                    p => p.status === 'pending'
                  ).length
                },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', paddingBottom: '12px',
                  marginBottom: '12px',
                  borderBottom: `1px solid ${border}`
                }}>
                  <span style={{
                    color: subtext, fontSize: '14px'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontWeight: 900, fontSize: '16px',
                    color: text
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>
                  Total Spent
                </span>
                <span style={{
                  color: '#22c55e', fontWeight: 900,
                  fontSize: '18px', fontFamily: 'monospace'
                }}>
                  {totalSpent.toLocaleString()} pts
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {tab === 'wallet' && user && (
          <WalletCard userId={user.id} userEmail={user.email || ''} />
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: '16px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${border}`
            }}>
              <p style={{
                fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase', color: subtext
              }}>
                Purchase History
              </p>
            </div>
            {purchases.length === 0 ? (
              <div style={{
                padding: '32px 20px', textAlign: 'center'
              }}>
                <Clock size={32} color={mutedText}
                  style={{ margin: '0 auto 12px' }} />
                <p style={{
                  color: mutedText, fontSize: '14px',
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
              purchases.map((p, i) => (
                <div key={p.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < purchases.length - 1
                    ? `1px solid ${border}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {p.signal_type === 'football' ? '⚽' : '✈️'}
                    </span>
                    <div>
                      <p style={{
                        fontWeight: 700, fontSize: '13px',
                        marginBottom: '2px', color: text
                      }}>
                        {p.signals_count}{' '}
                        {p.signal_type === 'football'
                          ? 'Game(s)' : 'Signal(s)'
                        }
                      </p>
                      <p style={{
                        color: mutedText, fontSize: '11px'
                      }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 700, fontSize: '13px',
                      fontFamily: 'monospace', color: '#22c55e'
                    }}>
                      {p.currency || 'KES'} {p.amount?.toLocaleString()}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '10px',
                      background: p.status === 'completed'
                        ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                      color: p.status === 'completed'
                        ? '#22c55e' : mutedText,
                      textTransform: 'uppercase'
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Help Links */}
        <div style={{
          marginTop: '20px', display: 'flex',
          justifyContent: 'center', gap: '20px', flexWrap: 'wrap'
        }}>
          {[
            { l: 'FAQ', h: '/faq' },
            { l: 'Support', h: '/support' },
            { l: 'Terms', h: '/terms' },
            { l: 'Privacy', h: '/privacy' },
          ].map(item => (
            <Link key={item.l} href={item.h} style={{
              color: mutedText, fontSize: '13px',
              textDecoration: 'none', fontWeight: 600
            }}>
              {item.l}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
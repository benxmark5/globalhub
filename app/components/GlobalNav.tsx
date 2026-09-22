'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Menu, X, Trophy, TrendingUp, Zap,
    User, LogOut, HelpCircle,
  Shield, FileText, Heart, ShoppingCart, ShoppingBag
} from 'lucide-react';
import { useCart } from '@/lib/cart';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GlobalNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string }
  } | null>(null);
  const { count: cartCount } = useCart();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent hydration mismatch by defaulting client-dependent values during SSR
  const currentCartCount = mounted ? cartCount : 0;
  const currentUser = mounted ? user : null;

  const navLinks = [
    {
      icon: TrendingUp, label: 'Football Signals',
      href: '/football', color: '#22c55e'
    },
    {
      icon: Zap, label: 'Aviator Signals',
      href: '/aviator', color: '#f87171'
    },
    {
      icon: Trophy, label: 'Play Aviator Game',
      href: '/aviator/game', color: '#fbbf24'
    },
    
    {
      icon: ShoppingCart, label: `Cart${currentCartCount > 0 ? ` (${currentCartCount})` : ''}`,
      href: '/cart', color: '#60a5fa'
    },
  ];

  const accountLinks = currentUser ? [
    { icon: User,        label: 'My Account',  href: '/account',  color: '#a78bfa' },
    { icon: ShoppingBag, label: 'My Orders',   href: '/account?tab=history', color: '#fbbf24' },
  ] : [
    { icon: User,   label: 'Login',    href: '/login',    color: '#60a5fa' },
    { icon: Trophy, label: 'Register', href: '/register', color: '#22c55e' },
  ];

  const infoLinks = [
    { icon: TrendingUp, label: 'Become a Provider', href: '/become-provider', color: '#22c55e' },
    { icon: HelpCircle, label: 'FAQ', href: '/faq', color: '#6b7280' },
    { icon: Shield, label: 'Support', href: '/support', color: '#6b7280' },
    { icon: FileText, label: 'Terms', href: '/terms', color: '#6b7280' },
    { icon: Heart, label: 'Responsible Gaming', href: '/responsible-gaming', color: '#6b7280' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', top: '12px', right: '16px',
          zIndex: 500,
          width: '44px', height: '44px',
          background: open ? '#374151' : 'rgba(15,31,51,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #1a2740',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer', touchAction: 'manipulation',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.2s'
        }}
      >
        {open
          ? <X size={20} color="white" />
          : <Menu size={20} color="white" />
        }
        {!open && currentCartCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            width: '18px', height: '18px',
            background: '#22c55e', borderRadius: '50%',
            fontSize: '10px', fontWeight: 900, color: 'black',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            {currentCartCount}
          </span>
        )}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 490,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '280px', height: '100dvh',
        background: '#0a1628',
        borderLeft: '1px solid #1a2740',
        zIndex: 495,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column'
      }}>

        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #1a2740',
          flexShrink: 0
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none', marginBottom: '14px'
          }}>
            <div style={{
              width: '32px', height: '32px',
              background: '#22c55e', borderRadius: '8px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={16} color="black" />
            </div>
            <span style={{
              fontWeight: 900, fontSize: '18px', color: 'white'
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>

          </Link>

          {currentUser && (
            <div style={{
              background: '#0f1f33',
              border: '1px solid #1a2740',
              borderRadius: '12px', padding: '12px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: '2px solid #22c55e',
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentUser.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} color="#22c55e" />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontWeight: 700, fontSize: '13px',
                  color: 'white', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {currentUser.user_metadata?.full_name || 'My Account'}
                </p>
                <p style={{
                  color: '#6b7280', fontSize: '11px',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '16px 12px' }}>

          <p style={{
            color: '#374151', fontSize: '10px',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '0 8px',
            marginBottom: '6px'
          }}>
            Signals & Features
          </p>
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 10px', borderRadius: '10px',
                marginBottom: '4px', textDecoration: 'none',
                background: active
                  ? `${link.color}15` : 'transparent',
                border: active
                  ? `1px solid ${link.color}30` : '1px solid transparent',
                transition: 'all 0.15s'
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: `${link.color}15`,
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={16} color={link.color} />
                </div>
                <span style={{
                  color: active ? link.color : '#d1d5db',
                  fontSize: '14px', fontWeight: active ? 900 : 600
                }}>
                  {link.label}
                </span>
                {active && (
                  <div style={{
                    marginLeft: 'auto', width: '6px', height: '6px',
                    background: link.color, borderRadius: '50%'
                  }} />
                )}
              </Link>
            );
          })}

          <div style={{
            height: '1px', background: '#1a2740',
            margin: '12px 0'
          }} />

          <p style={{
            color: '#374151', fontSize: '10px',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '0 8px',
            marginBottom: '6px'
          }}>
            Account
          </p>
          {accountLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.label} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 10px', borderRadius: '10px',
                marginBottom: '4px', textDecoration: 'none',
                background: active ? `${link.color}15` : 'transparent',
                border: active ? `1px solid ${link.color}30` : '1px solid transparent',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: `${link.color}15`,
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={link.color} />
                </div>
                <span style={{
                  color: active ? link.color : '#d1d5db',
                  fontSize: '14px', fontWeight: active ? 900 : 600
                }}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          <div style={{
            height: '1px', background: '#1a2740',
            margin: '12px 0'
          }} />

          <p style={{
            color: '#374151', fontSize: '10px',
            fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '0 8px',
            marginBottom: '6px'
          }}>
            Help & Legal
          </p>
          {infoLinks.map(link => {
            const Icon = link.icon;
            const isProvider = link.href === '/become-provider';
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px', borderRadius: '10px',
                marginBottom: '2px', textDecoration: 'none'
              }}>
                <Icon size={15} color={isProvider ? link.color : "#374151"} />
                <span style={{
                  color: isProvider ? '#22c55e' : '#6b7280', 
                  fontSize: '13px',
                  fontWeight: isProvider ? 700 : 400
                }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #1a2740', flexShrink: 0
        }}>
          {currentUser ? (
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px', cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <LogOut size={16} color="#f87171" />
              <span style={{
                color: '#f87171', fontSize: '14px', fontWeight: 700
              }}>
                Log Out
              </span>
            </button>
          ) : (
            <Link href="/register" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              background: '#22c55e', color: 'black',
              padding: '14px', borderRadius: '12px',
              fontWeight: 900, fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
            }}>
              🚀 Join GlobalHub Free
            </Link>
          )}
          <p style={{
            color: '#374151', fontSize: '11px',
            textAlign: 'center', marginTop: '10px'
          }}>
            v1.0 · 100+ countries · 10 languages
          </p>
        </div>
      </div>
    </>
  );
}
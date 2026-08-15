"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, LayoutDashboard, Ticket,
  ShoppingCart, User, MoreHorizontal,
  TrendingUp, Zap, DollarSign, BarChart3,
  Activity, Calendar, Bell, ShoppingBag,
  HelpCircle, Shield, FileText, LogOut,
  X, ChevronRight, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';

const MORE_ITEMS = [
  { icon: TrendingUp, label: 'Football Signals', href: '/football', color: '#22c55e' },
  { icon: Zap,        label: 'Aviator Signals',  href: '/aviator',  color: '#f87171' },
  { icon: DollarSign, label: 'Pricing',          href: '/pricing',  color: '#fbbf24' },
  { icon: BarChart3,  label: 'Statistics',       href: '/statistics',color: '#60a5fa'},
  { icon: Activity,   label: 'Live Scores',      href: '/scores',   color: '#34d399' },
  { icon: Calendar,   label: 'Events',           href: '/events',   color: '#a78bfa' },
  { icon: Ticket,     label: 'Stadium Tickets',  href: '/tickets',  color: '#fb923c' },
  { icon: ShoppingBag,label: 'My Orders',        href: '/account?tab=history', color: '#e879f9'},
  { icon: Bell,       label: 'Notifications',    href: '/notifications', color: '#fbbf24'},
  { icon: HelpCircle, label: 'Support',          href: '/support',  color: '#6b7280' },
  { icon: HelpCircle, label: 'FAQ',              href: '/faq',      color: '#6b7280' },
  { icon: Shield,     label: 'Privacy',          href: '/privacy',  color: '#6b7280' },
  { icon: FileText,   label: 'Terms',            href: '/terms',    color: '#6b7280' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [showMore, setShowMore] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check unread notifications
        supabase.from('notifications')
          .select('id', { count: 'exact' })
          .eq('user_id', session.user.id)
          .eq('is_read', false)
          .then(({ count }) => setUnreadNotifs(count || 0));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMore(false);
    router.push('/');
  };

  const NAV_ITEMS = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/account' },
    { icon: Ticket, label: 'Tickets', href: '/tickets' },
    {
      icon: ShoppingCart, label: 'Cart', href: '/cart',
      badge: count > 0 ? count : null
    },
    { icon: User, label: 'Account', href: user ? '/account' : '/login' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* More Sheet Backdrop */}
      {showMore && (
        <div
          onClick={() => setShowMore(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* More Bottom Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 201,
        transform: showMore ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        background: '#0a1628',
        borderTop: '1px solid #1a2740',
        borderRadius: '20px 20px 0 0',
        maxHeight: '80vh',
        overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom, 80px)',
      }}>
        {/* Sheet handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', background: '#1a2740', borderRadius: '2px' }} />
        </div>

        {/* Sheet header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '12px 20px 8px'
        }}>
          <span style={{ fontWeight: 900, fontSize: '16px', color: 'white' }}>
            More
          </span>
          <button type="button" onClick={() => setShowMore(false)}
            style={{ background: '#1a2740', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', touchAction: 'manipulation' }}>
            <X size={16} />
          </button>
        </div>

        {/* Grid of items */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px', padding: '8px 16px 16px'
        }}>
          {MORE_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setShowMore(false)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px',
                  background: '#0f1f33',
                  border: '1px solid #1a2740',
                  borderRadius: '14px', padding: '16px 8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: `${item.color}15`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <span style={{
                  color: '#9ca3af', fontSize: '11px',
                  fontWeight: 600, textAlign: 'center', lineHeight: 1.3
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout if logged in */}
          {user && (
            <button type="button" onClick={handleLogout}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '14px', padding: '16px 8px',
                cursor: 'pointer', touchAction: 'manipulation'
              }}>
              <div style={{ width: '44px', height: '44px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={20} color="#f87171" />
              </div>
              <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 600 }}>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom Nav Bar ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(10,22,40,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #1a2740',
        display: 'flex', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: '64px',
      }}>
        {NAV_ITEMS.slice(0, 2).map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', height: '100%',
              textDecoration: 'none', position: 'relative'
            }}>
              <Icon size={22} color={active ? '#22c55e' : '#374151'} />
              <span style={{ fontSize: '10px', color: active ? '#22c55e' : '#374151', fontWeight: active ? 700 : 500 }}>
                {item.label}
              </span>
              {active && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '28px', height: '3px', background: '#22c55e', borderRadius: '0 0 4px 4px' }} />
              )}
            </Link>
          );
        })}

        {/* More button — center */}
        <button type="button" onClick={() => setShowMore(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '3px', height: '100%', background: 'none',
            border: 'none', cursor: 'pointer', touchAction: 'manipulation'
          }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
          }}>
            <MoreHorizontal size={18} color="black" />
          </div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>More</span>
        </button>

        {NAV_ITEMS.slice(2).map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', height: '100%',
              textDecoration: 'none', position: 'relative'
            }}>
              <div style={{ position: 'relative' }}>
                <Icon size={22} color={active ? '#22c55e' : '#374151'} />
                {item.badge && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-8px',
                    width: '16px', height: '16px',
                    background: '#22c55e', borderRadius: '50%',
                    fontSize: '9px', fontWeight: 900, color: 'black',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.label === 'Account' && unreadNotifs > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-8px',
                    width: '16px', height: '16px',
                    background: '#ef4444', borderRadius: '50%',
                    fontSize: '9px', fontWeight: 900, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadNotifs}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '10px', color: active ? '#22c55e' : '#374151', fontWeight: active ? 700 : 500 }}>
                {item.label}
              </span>
              {active && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '28px', height: '3px', background: '#22c55e', borderRadius: '0 0 4px 4px' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom padding so content isn't hidden behind nav */}
      <div style={{ height: '64px' }} />
    </>
  );
}
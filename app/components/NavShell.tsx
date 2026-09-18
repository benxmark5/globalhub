// app/components/NavShell.tsx
"use client";

import { useState, useEffect, type ReactElement } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import {
  Home, ShoppingCart, Gamepad2, HelpCircle, User as UserIcon,
  Menu, X, LogOut, ChevronLeft, ChevronRight,
  Rocket, Wallet, Bell, Ticket, Settings, FileText, Shield, Heart,
} from 'lucide-react';
import { c, s, r, f, sh, t } from '@/lib/design';

// ─────────────────────────────────────────────────────────
// Nav config
// ─────────────────────────────────────────────────────────
const BOTTOM_NAV = [
  { icon: Home,          label: 'Home',    href: '/' },
  { icon: ShoppingCart,  label: 'Market',  href: '/marketplace' },
  { icon: Gamepad2,      label: 'Play',    href: '/aviator/game' },
  { icon: HelpCircle,    label: 'Support', href: '/support' },
  { icon: UserIcon,      label: 'Account', href: '/account' },
];

const SIDEBAR_PRIMARY = [
  { icon: Home,          label: 'Home',         href: '/' },
  { icon: ShoppingCart,  label: 'Marketplace',  href: '/marketplace' },
  { icon: Rocket,        label: 'Play Aviator', href: '/aviator/game' },
  { icon: Wallet,        label: 'Dashboard',    href: '/account' },
];

const SIDEBAR_SECONDARY = [
  { icon: Ticket,  label: 'My Orders',     href: '/account?tab=history' },
  { icon: Bell,    label: 'Notifications', href: '/notifications' },
];

const SIDEBAR_ACCOUNT = [
  { icon: UserIcon,   label: 'Profile',  href: '/account' },
  { icon: Settings,   label: 'Settings', href: '/account?tab=settings' },
  { icon: HelpCircle, label: 'Support',  href: '/support' },
];

const SIDEBAR_LEGAL = [
  { icon: FileText, label: 'Terms',              href: '/terms' },
  { icon: Shield,   label: 'Privacy',            href: '/privacy' },
  { icon: Heart,    label: 'Responsible Gaming', href: '/responsible-gaming' },
];

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 68;

interface Props {
  user: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null;
}

export default function NavShell({ user }: Props): ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: cartCount } = useCart();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nav_collapsed');
      if (saved === 'true') setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('nav_collapsed', String(next)); } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const path = href.split('?')[0];
    return pathname === path || pathname.startsWith(path + '/');
  };

  // ── Sidebar content (shared between desktop and mobile) ──
  const sidebarContent = (isMobile: boolean) => {
    const showLabels = isMobile || !collapsed;
    return (
      <>
        {/* ── Logo ── */}
        <div
          style={{
            padding: showLabels ? `${s[5]}px ${s[5]}px` : `${s[5]}px ${s[2]}px`,
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: s[3],
            justifyContent: showLabels ? 'flex-start' : 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              background: c.gradBrand,
              borderRadius: r.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: sh.brand,
            }}
          >
            <span style={{ color: '#000', fontWeight: 900, fontSize: 15 }}>GH</span>
          </div>
          {showLabels && (
            <span
              style={{
                fontWeight: 900,
                fontSize: f.lg,
                color: c.text,
                letterSpacing: '-0.02em',
              }}
            >
              GLOBAL<span style={{ color: c.brand }}>HUB</span>
            </span>
          )}
        </div>

        {/* ── User chip ── */}
        {showLabels && user && (
          <div
            style={{
              margin: s[4],
              background: c.bgSubtle,
              border: `1px solid ${c.border}`,
              borderRadius: r.md,
              padding: s[3],
              display: 'flex',
              alignItems: 'center',
              gap: s[3],
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: r.full,
                background: c.brandDim,
                border: `2px solid ${c.brand}`,
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserIcon size={14} color={c.brand} />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: f.sm,
                  color: c.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {user.user_metadata?.full_name || 'My Account'}
              </p>
              <p
                style={{
                  color: c.textDim,
                  fontSize: 11,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* ── Scrollable nav area ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${s[2]}px ${s[3]}px`,
          }}
        >
          {/* Primary */}
          {SIDEBAR_PRIMARY.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={isActive(link.href)}
              showLabel={showLabels}
              badge={link.href === '/marketplace' && cartCount > 0 ? cartCount : undefined}
            />
          ))}

          <Divider />

          {/* Secondary */}
          {SIDEBAR_SECONDARY.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={isActive(link.href)}
              showLabel={showLabels}
            />
          ))}

          <Divider />

          {showLabels && <SectionLabel>Account</SectionLabel>}
          {SIDEBAR_ACCOUNT.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={isActive(link.href)}
              showLabel={showLabels}
            />
          ))}

          {showLabels && (
            <>
              <Divider />
              <SectionLabel>Legal</SectionLabel>
              {SIDEBAR_LEGAL.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: s[3],
                    padding: `${s[2]}px ${s[3]}px`,
                    borderRadius: r.sm,
                    textDecoration: 'none',
                    transition: `background ${t.fast}`,
                  }}
                >
                  <link.icon size={15} color={c.textDim} />
                  <span style={{ color: c.textMuted, fontSize: f.sm }}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: `${s[3]}px ${s[3]}px`,
            borderTop: `1px solid ${c.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: s[2],
            flexShrink: 0,
          }}
        >
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: s[3],
                padding: showLabels ? `${s[3]}px ${s[3]}px` : `${s[3]}px 0`,
                justifyContent: showLabels ? 'flex-start' : 'center',
                background: c.dangerDim,
                border: `1px solid rgba(239,68,68,0.2)`,
                borderRadius: r.sm,
                cursor: 'pointer',
                width: '100%',
                transition: `background ${t.fast}`,
              }}
            >
              <LogOut size={16} color={c.danger} />
              {showLabels && (
                <span style={{ color: c.danger, fontSize: f.sm, fontWeight: 700 }}>
                  Logout
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: s[3],
                padding: showLabels ? `${s[3]}px ${s[3]}px` : `${s[3]}px 0`,
                justifyContent: showLabels ? 'flex-start' : 'center',
                background: c.brand,
                borderRadius: r.sm,
                textDecoration: 'none',
              }}
            >
              <UserIcon size={16} color="#000" />
              {showLabels && (
                <span style={{ color: '#000', fontSize: f.sm, fontWeight: 900 }}>
                  Sign In
                </span>
              )}
            </Link>
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapsed}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s[2],
                padding: `${s[2]}px`,
                background: 'transparent',
                border: `1px solid ${c.border}`,
                borderRadius: r.sm,
                cursor: 'pointer',
                width: '100%',
                color: c.textDim,
                transition: `all ${t.fast}`,
              }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <>
                  <ChevronLeft size={14} />
                  <span style={{ fontSize: f.xs, fontWeight: 600 }}>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      {isDesktop && (
        <>
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
              background: c.surface,
              borderRight: `1px solid ${c.border}`,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              transition: `width ${t.smooth}`,
              overflow: 'hidden',
            }}
          >
            {sidebarContent(false)}
          </aside>
          <div
            aria-hidden
            style={{
              width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
              transition: `width ${t.smooth}`,
              flexShrink: 0,
            }}
          />
        </>
      )}

      {/* MOBILE TOP BAR */}
      {!isDesktop && (
        <>
          <header
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              background: 'rgba(10,14,21,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${c.border}`,
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `0 ${s[4]}px`,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: c.text,
                cursor: 'pointer',
                padding: s[2],
                borderRadius: r.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
              }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: s[2],
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: c.gradBrand,
                  borderRadius: r.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontWeight: 900, fontSize: 12 }}>GH</span>
              </div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: f.base,
                  color: c.text,
                  letterSpacing: '-0.02em',
                }}
              >
                GLOBAL<span style={{ color: c.brand }}>HUB</span>
              </span>
            </Link>

            <div style={{ width: 38 }} />
          </header>
          <div style={{ height: 56 }} />
        </>
      )}

      {/* MOBILE SIDEBAR OVERLAY */}
      {!isDesktop && mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 490,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 280,
              maxWidth: '85vw',
              background: c.surface,
              borderRight: `1px solid ${c.border}`,
              zIndex: 495,
              display: 'flex',
              flexDirection: 'column',
              animation: 'navSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: c.bgSubtle,
                border: `1px solid ${c.border}`,
                borderRadius: r.sm,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 500,
                color: c.textMuted,
              }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            {sidebarContent(true)}
          </aside>
        </>
      )}

      {/* MOBILE BOTTOM NAV */}
      {!isDesktop && (
        <>
          <nav
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: 64,
              background: 'rgba(10,14,21,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: `1px solid ${c.border}`,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {BOTTOM_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const showBadge = item.href === '/marketplace' && cartCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    height: '100%',
                    textDecoration: 'none',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Icon size={21} color={active ? c.brand : c.textDim} />
                    {showBadge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -8,
                          background: c.brand,
                          color: '#000',
                          fontSize: 9,
                          fontWeight: 900,
                          borderRadius: 10,
                          padding: '1px 5px',
                          minWidth: 15,
                          textAlign: 'center',
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: active ? c.brand : c.textDim,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 28,
                        height: 3,
                        background: c.brand,
                        borderRadius: '0 0 4px 4px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div style={{ height: 64 }} />
        </>
      )}

      <style>{`
        @keyframes navSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Internal components
// ─────────────────────────────────────────────────────────

function NavLink({
  icon: Icon,
  label,
  href,
  active,
  showLabel,
  badge,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  href: string;
  active: boolean;
  showLabel: boolean;
  badge?: number;
}): ReactElement {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s[3],
        padding: showLabel ? `${s[3]}px ${s[3]}px` : `${s[3]}px 0`,
        marginBottom: 2,
        borderRadius: r.sm,
        textDecoration: 'none',
        justifyContent: showLabel ? 'flex-start' : 'center',
        background: active ? c.brandDim : 'transparent',
        transition: `background ${t.fast}`,
        position: 'relative',
      }}
    >
      <Icon size={18} color={active ? c.brand : c.textMuted} />
      {showLabel && (
        <span
          style={{
            color: active ? c.brand : c.text,
            fontSize: f.sm,
            fontWeight: active ? 700 : 500,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: s[2],
            flex: 1,
          }}
        >
          {label}
          {badge !== undefined && badge > 0 && (
            <span
              style={{
                background: c.brand,
                color: '#000',
                fontSize: 10,
                fontWeight: 900,
                borderRadius: 10,
                padding: '1px 7px',
                minWidth: 18,
                textAlign: 'center',
              }}
            >
              {badge}
            </span>
          )}
        </span>
      )}
      {active && !showLabel && (
        <div
          style={{
            position: 'absolute',
            left: -2,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 18,
            background: c.brand,
            borderRadius: r.full,
          }}
        />
      )}
    </Link>
  );
}

function Divider(): ReactElement {
  return (
    <div
      style={{
        height: 1,
        background: c.border,
        margin: `${s[3]}px ${s[2]}px`,
      }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <p
      style={{
        color: c.textDim,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: `0 ${s[3]}px`,
        margin: `${s[3]}px 0 ${s[1]}px`,
      }}
    >
      {children}
    </p>
  );
}
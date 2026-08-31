'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // Adjust path if your client is located elsewhere

interface ShellContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  unreadCount: number;
  user: any | null;
  wallet: any | null;
}

const ShellContext = createContext<ShellContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  unreadCount: 0,
  user: null,
  wallet: null,
});

export const useShell = () => useContext(ShellContext);

const publicRoutes = ['/login', '/register', '/auth/callback', '/onboarding', '/become-provider', '/terms', '/privacy', '/faq'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const supabase = createClient();

  const isBypassed = publicRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch Wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (walletData) setWallet(walletData);

        // Fetch Unread Notifications Count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);
        if (count !== null) setUnreadCount(count);
      }
    }

    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (isBypassed) {
    return <main className="min-h-screen bg-[#0b0e1a] text-white">{children}</main>;
  }

  return (
    <ShellContext.Provider value={{ sidebarOpen, setSidebarOpen, unreadCount, user, wallet }}>
      <div className="gh-shell">
        {/* Mobile Sidebar Backdrop */}
        <div
          className={`gh-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar (Desktop Persistent & Mobile Slide-in) */}
        <aside className={`gh-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="gh-sidebar-logo">
            <div className="gh-sidebar-logo-icon">GH</div>
            <div className="gh-sidebar-logo-text">
              GLOBAL<span>HUB</span>
            </div>
          </div>

          {user && (
            <div className="gh-sidebar-user">
              <div className="gh-sidebar-avatar">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="gh-sidebar-user-info">
                <div className="gh-sidebar-user-name">{user.email}</div>
                <div className="gh-sidebar-user-badge">
                  <span className="gh-dot-live"></span> Verified
                </div>
              </div>
            </div>
          )}

          <nav className="gh-sidebar-nav">
            <div className="gh-sidebar-section">Menu</div>
            <SidebarNavItem href="/" label="Home" icon="🏠" currentPath={pathname} />
            <SidebarNavItem href="/sports" label="Sports" icon="⚽" currentPath={pathname} />
            <SidebarNavItem href="/signals" label="Odds & Signals" icon="📊" currentPath={pathname} />
            <SidebarNavItem href="/aviator" label="Aviator Signals" icon="🚀" currentPath={pathname} />
            <SidebarNavItem href="/tickets" label="Events & Tickets" icon="🎟️" currentPath={pathname} />
            <SidebarNavItem href="/crash" label="Crash Game" icon="📈" currentPath={pathname} />

            <div className="gh-sidebar-section">Account</div>
            <SidebarNavItem href="/dashboard" label="Dashboard" icon="🎛️" currentPath={pathname} />
            <SidebarNavItem href="/cashier" label="Cashier" icon="💰" currentPath={pathname} />
            <SidebarNavItem href="/profile" label="Profile" icon="👤" currentPath={pathname} />
            <SidebarNavItem
              href="/notifications"
              label="Notifications"
              icon="🔔"
              badge={unreadCount > 0 ? unreadCount : undefined}
              currentPath={pathname}
            />
            <SidebarNavItem href="/support" label="Support" icon="🎧" currentPath={pathname} />
            <SidebarNavItem href="/settings" label="Settings" icon="⚙️" currentPath={pathname} />
          </nav>

          <div className="gh-sidebar-footer">
            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="gh-btn gh-btn-danger gh-btn-sm gh-btn-full"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="gh-btn gh-btn-primary gh-btn-sm gh-btn-full">
                Sign In
              </Link>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="gh-main flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="gh-header lg:hidden">
            <div className="gh-header-logo">
              <div className="gh-header-logo-icon">GH</div>
              <span>GlobalHub</span>
            </div>
            <div className="gh-header-actions">
              <button
                onClick={() => router.push('/notifications')}
                className="gh-header-btn"
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="gh-header-notif-dot" />}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="gh-header-btn"
                aria-label="Toggle Menu"
              >
                ☰
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          {/* Mobile Bottom Navigation */}
          <nav className="gh-bottom-nav lg:hidden">
            <BottomNavItem href="/" label="Home" icon="🏠" currentPath={pathname} />
            <BottomNavItem href="/sports" label="Sports" icon="⚽" currentPath={pathname} />
            <BottomNavItem href="/tickets" label="Events" icon="🎟️" currentPath={pathname} />
            <BottomNavItem href="/dashboard" label="Dashboard" icon="🎛️" currentPath={pathname} />
            <BottomNavItem
              href="/profile"
              label="Profile"
              icon="👤"
              badge={unreadCount > 0 ? unreadCount : undefined}
              currentPath={pathname}
            />
          </nav>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

function SidebarNavItem({
  href,
  label,
  icon,
  badge,
  currentPath,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  currentPath: string;
}) {
  const isActive = currentPath === href;
  return (
    <Link href={href} className={`gh-nav-item ${isActive ? 'active' : ''}`}>
      <span className="gh-nav-icon">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && <span className="gh-nav-badge">{badge}</span>}
    </Link>
  );
}

function BottomNavItem({
  href,
  label,
  icon,
  badge,
  currentPath,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  currentPath: string;
}) {
  const isActive = currentPath === href;
  return (
    <Link href={href} className={`gh-bottom-nav-item ${isActive ? 'active' : ''}`}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{label}</span>
      {badge !== undefined && <span className="gh-bottom-nav-badge">{badge}</span>}
    </Link>
  );
}
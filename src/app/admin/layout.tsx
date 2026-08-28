import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/client';

const adminNav = [
  { label: 'Overview', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Sports', href: '/admin/sports' },
  { label: 'Odds & Signals', href: '/admin/odds-signals' },
  { label: 'Aviator Signals', href: '/admin/aviator-signals' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Tickets', href: '/admin/tickets' },
  { label: 'Crash Game', href: '/admin/crash-game' },
  { label: 'Cashier', href: '/admin/cashier' },
  { label: 'Deposits', href: '/admin/deposits' },
  { label: 'Withdrawals', href: '/admin/withdrawals' },
  { label: 'Transactions', href: '/admin/transactions' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Risk & Compliance', href: '/admin/risk-compliance' },
  { label: 'Audit Logs', href: '/admin/audit-logs' },
  { label: 'Settings', href: '/admin/settings' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) redirect('/auth/login?error=unauthorized');

  return (
    <div className="min-h-screen bg-gh-bg flex">
      <aside className="w-64 bg-gh-bg-secondary border-r border-gh-border fixed h-screen overflow-y-auto">
        <div className="p-4 border-b border-gh-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gh-accent to-gh-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gh-text-primary">Admin Hub</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {adminNav.map(item => (
            <Link key={item.href} href={item.href}
              className="block px-3 py-2 rounded-xl text-sm text-gh-text-secondary hover:text-gh-text-primary hover:bg-gh-bg-elevated transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 ml-64">
        <div className="gh-page-container py-6">{children}</div>
      </main>
    </div>
  );
}

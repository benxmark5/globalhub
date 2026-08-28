'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { EventCard } from '@/components/cards/EventCard';
import { SignalCard } from '@/components/cards/SignalCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyStateSignals } from '@/components/empty-states/EmptyState';
import { fetchEvents, fetchSignals, fetchWallet } from '@/lib/api/services';
import type { Signal, StadiumEvent, Wallet } from '@/types';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [events, setEvents] = useState<StadiumEvent[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: ev }, { data: sig }] = await Promise.all([
        fetchEvents('upcoming'), fetchSignals()
      ]);
      setEvents(ev?.slice(0, 3) || []);
      setSignals(sig?.slice(0, 3) || []);
      if (user?.id) {
        const { data: w } = await fetchWallet(user.id);
        setWallet(w);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const quickLinks = [
    { label: 'Sports', href: '/sports', icon: '⚽' },
    { label: 'Odds & Signals', href: '/odds-signals', icon: '📊' },
    { label: 'Aviator', href: '/aviator-signals', icon: '✈️' },
    { label: 'Events', href: '/events', icon: '🎫' },
    { label: 'Crash Game', href: '/crash-game', icon: '🚀' },
    { label: 'Cashier', href: '/cashier', icon: '💰' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gh-text-primary mb-1">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-gh-text-secondary">Your hub for sports, signals, and tickets.</p>
      </div>

      {isAuthenticated && wallet && (
        <BalanceCard availableBalance={wallet.available_balance} pendingBalance={wallet.pending_balance} currency={wallet.currency} />
      )}

      <section>
        <h2 className="gh-section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gh-bg-elevated border border-gh-border hover:border-gh-border-light transition-all hover:scale-[1.02]">
              <span className="text-2xl">{link.icon}</span>
              <span className="text-xs font-medium text-gh-text-secondary text-center">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="gh-section-title">Today&apos;s Signals</h2>
          <Link href="/odds-signals" className="text-sm text-gh-accent-light hover:text-gh-accent">View All →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signals.map(s => <SignalCard key={s.id} signal={s} />)}
          </div>
        ) : <EmptyStateSignals />}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="gh-section-title">Upcoming Events</h2>
          <Link href="/events" className="text-sm text-gh-accent-light hover:text-gh-accent">View All →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div className="gh-card p-8 text-center text-gh-text-muted">No upcoming events at the moment.</div>
        )}
      </section>
    </div>
  );
}
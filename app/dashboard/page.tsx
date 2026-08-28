'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DashboardCard } from '@/components/cards/DashboardCard';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { TransactionItem } from '@/components/cards/TransactionItem';
import { TicketCard } from '@/components/cards/TicketCard';
import { SkeletonList } from '@/components/ui/Skeleton';
import { fetchWallet, fetchTransactions, fetchUserTickets, fetchPurchasedSignals } from '@/lib/api/services';
import type { Wallet, Transaction, Ticket, Signal } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      const [{ data: w }, { data: t }, { data: tk }, { data: s }] = await Promise.all([
        fetchWallet(user.id), fetchTransactions(user.id),
        fetchUserTickets(user.id), fetchPurchasedSignals(user.id)
      ]);
      setWallet(w); setTransactions(t?.slice(0, 5) || []);
      setTickets(tk?.slice(0, 3) || []); setSignals(s?.slice(0, 3) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gh-text-primary">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Available" value={wallet ? `$${wallet.available_balance.toFixed(2)}` : '$0.00'} icon={<span className="text-lg">💵</span>} color="success" href="/cashier" />
        <DashboardCard title="Pending" value={wallet ? `$${wallet.pending_balance.toFixed(2)}` : '$0.00'} icon={<span className="text-lg">⏳</span>} color="warning" />
        <DashboardCard title="Tickets" value={tickets.length} icon={<span className="text-lg">🎫</span>} color="accent" href="/my-tickets" />
        <DashboardCard title="Signals" value={signals.length} icon={<span className="text-lg">📊</span>} color="purple" href="/odds-signals" />
      </div>
      {wallet && <BalanceCard {...wallet} />}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="gh-section-title">Recent Activity</h2>
          <Link href="/cashier?tab=history" className="text-sm text-gh-accent-light">View All →</Link>
        </div>
        {loading ? <SkeletonList count={3} /> : transactions.map(t => <TransactionItem key={t.id} transaction={t} className="mb-3" />)}
      </section>
      {tickets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="gh-section-title">My Tickets</h2>
            <Link href="/my-tickets" className="text-sm text-gh-accent-light">View All →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}
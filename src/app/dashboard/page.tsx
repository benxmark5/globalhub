'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { formatCurrency } from '@/config/currency';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/Primitives';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          window.location.href = '/login';
          return;
        }

        const userId = session.user.id;

        // Fetch parallel resources
        const [walletRes, txRes, ticketRes, signalRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', userId).single(),
          supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
          supabase.from('ticket_orders').select('*, stadium_events(*)').eq('user_id', userId).limit(5),
          supabase.from('purchases').select('*').eq('user_id', userId).eq('status', 'completed').limit(5)
        ]);

        if (walletRes.data) setWallet(walletRes.data);
        if (txRes.data) setTransactions(txRes.data);
        if (ticketRes.data) setTickets(ticketRes.data);
        if (signalRes.data) setSignals(signalRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="gh-page space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="gh-grid-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gh-page">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const pendingBalance = wallet?.pending_balance ?? 0;

  return (
    <div className="gh-page space-y-6 animate-fadeIn">
      {/* Balance Banner */}
      <div className="gh-balance-card">
        <div className="gh-balance-label">Total Available Balance</div>
        <div className="gh-balance-amount">{formatCurrency(balance)}</div>
        <div className="gh-balance-sub">Pending Deposits/Wins: {formatCurrency(pendingBalance)}</div>
        <div className="flex gap-3 mt-4 relative z-10">
          <Link href="/cashier" className="gh-btn gh-btn-sm bg-white text-slate-900 font-bold hover:bg-slate-100">
            Deposit Funds
          </Link>
          <Link href="/cashier" className="gh-btn gh-btn-sm gh-btn-ghost text-white border-white/20">
            Withdraw
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="gh-grid-4">
        <Link href="/sports" className="gh-quick-action">
          <div className="gh-quick-action-icon">?</div>
          <div className="gh-quick-action-label">Live Sports</div>
        </Link>
        <Link href="/signals" className="gh-quick-action">
          <div className="gh-quick-action-icon">??</div>
          <div className="gh-quick-action-label">Odds & Signals</div>
        </Link>
        <Link href="/tickets" className="gh-quick-action">
          <div className="gh-quick-action-icon">???</div>
          <div className="gh-quick-action-label">Match Tickets</div>
        </Link>
        <Link href="/crash" className="gh-quick-action">
          <div className="gh-quick-action-icon">??</div>
          <div className="gh-quick-action-label">Crash Game</div>
        </Link>
      </div>

      {/* Recent Transactions Section */}
      <div className="gh-card p-5">
        <div className="gh-section-header">
          <h2 className="gh-section-title">Recent Transactions</h2>
          <Link href="/cashier" className="gh-section-link">View All</Link>
        </div>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Your deposit, withdrawal, and purchase records will show up here." />
        ) : (
          <div>
            {transactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'win';
              return (
                <div key={tx.id} className="gh-tx">
                  <div className={gh-tx-icon }>
                    {isCredit ? '?' : '?'}
                  </div>
                  <div className="gh-tx-meta">
                    <div className="gh-tx-title capitalize">{tx.type} — {tx.status}</div>
                    <div className="gh-tx-date">{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div className={gh-tx-amount }>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Tickets Section */}
      <div className="gh-card p-5">
        <div className="gh-section-header">
          <h2 className="gh-section-title">My Stadium Tickets</h2>
          <Link href="/tickets" className="gh-section-link">Browse Events</Link>
        </div>
        {tickets.length === 0 ? (
          <EmptyState title="No active tickets" description="Purchase match tickets to view QR codes and entry instructions here." />
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{t.stadium_events?.title || 'Stadium Event'}</div>
                  <div className="text-xs text-slate-400 mt-1">Ticket #: {t.ticket_number || t.id.slice(0, 8)}</div>
                </div>
                <Link href={/tickets} className="gh-btn gh-btn-sm gh-btn-outline">
                  View QR
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

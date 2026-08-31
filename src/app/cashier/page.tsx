'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/config/currency';
import { Skeleton, EmptyState, ErrorState, Modal } from '@/components/ui/Primitives';

export default function CashierPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeCurrency, setActiveCurrency] = useState('USD');
  
  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadCashierData();
  }, [supabase]);

  async function loadCashierData() {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }

      const userId = session.user.id;

      const [walletRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', userId).single(),
        supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (walletRes.data) {
        setWallet(walletRes.data);
        if (walletRes.data.currency) setActiveCurrency(walletRes.data.currency);
      }
      if (txRes.data) setTransactions(txRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cashier data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Insert pending deposit record for backend webhook verification
      const { error: txError } = await supabase.from('wallet_transactions').insert({
        user_id: session.user.id,
        type: 'deposit',
        amount: Number(amount),
        currency: activeCurrency,
        status: 'pending'
      });

      if (txError) throw txError;

      setSuccessMsg('Deposit request initiated successfully. Awaiting payment gateway verification.');
      setIsDepositOpen(false);
      setAmount('');
      loadCashierData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (Number(amount) > (wallet?.balance ?? 0)) {
      setError('Insufficient funds for withdrawal');
      return;
    }
    try {
      setActionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error: txError } = await supabase.from('wallet_transactions').insert({
        user_id: session.user.id,
        type: 'withdrawal',
        amount: Number(amount),
        currency: activeCurrency,
        status: 'pending'
      });

      if (txError) throw txError;

      setSuccessMsg('Withdrawal request submitted. Processing via secure backend payout service.');
      setIsWithdrawOpen(false);
      setAmount('');
      loadCashierData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="gh-page space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="gh-page">
        <ErrorState message={error} onRetry={loadCashierData} />
      </div>
    );
  }

  return (
    <div className="gh-page space-y-6 animate-fadeIn">
      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Cashier Balance Header */}
      <div className="gh-balance-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="gh-balance-label">Cashier & Wallet Center</div>
          <div className="gh-balance-amount">{formatCurrency(wallet?.balance ?? 0, activeCurrency)}</div>
          <div className="gh-balance-sub">Secured via Server-Side Ledger Verification</div>
        </div>
        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="gh-btn gh-btn-sm bg-white text-slate-900 font-bold hover:bg-slate-100"
          >
            + Deposit Funds
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="gh-btn gh-btn-sm gh-btn-ghost text-white border-white/20"
          >
            - Withdraw
          </button>
        </div>
      </div>

      {/* Currency Selector Bar */}
      <div className="gh-card p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-300">Display Currency:</span>
        <select
          value={activeCurrency}
          onChange={(e) => setActiveCurrency(e.target.value)}
          className="gh-select max-w-xs"
        >
          {Object.values(SUPPORTED_CURRENCIES).map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol}) — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction History */}
      <div className="gh-card p-5">
        <h2 className="gh-section-title mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions recorded" description="All deposits, withdrawals, and platform payouts will appear here." />
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'win';
              const statusColor =
                tx.status === 'completed'
                  ? 'gh-badge-success'
                  : tx.status === 'pending' || tx.status === 'processing'
                  ? 'gh-badge-warning'
                  : 'gh-badge-danger';

              return (
                <div key={tx.id} className="gh-tx">
                  <div className={gh-tx-icon }>
                    {isCredit ? '?' : '?'}
                  </div>
                  <div className="gh-tx-meta">
                    <div className="flex items-center gap-2">
                      <span className="gh-tx-title capitalize">{tx.type}</span>
                      <span className={gh-badge }>{tx.status}</span>
                    </div>
                    <div className="gh-tx-date">{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div className={gh-tx-amount }>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount, activeCurrency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} title="Deposit Funds">
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="gh-label">Amount ({activeCurrency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="gh-input"
              required
            />
          </div>
          <button type="submit" disabled={actionLoading} className="gh-btn gh-btn-primary gh-btn-full">
            {actionLoading ? 'Processing...' : 'Proceed to Gateway'}
          </button>
        </form>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} title="Withdraw Funds">
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="gh-label">Amount ({activeCurrency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="gh-input"
              required
            />
          </div>
          <button type="submit" disabled={actionLoading} className="gh-btn gh-btn-primary gh-btn-full">
            {actionLoading ? 'Processing...' : 'Request Payout'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

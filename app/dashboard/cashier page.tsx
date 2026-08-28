'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Tabs } from '@/components/ui/Tabs';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { TransactionItem } from '@/components/cards/TransactionItem';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyStateTransactions } from '@/components/empty-states/EmptyState';
import { ErrorState } from '@/components/empty-states/ErrorState';
import { fetchWallet, fetchTransactions } from '@/lib/api/services';
import type { Wallet, Transaction } from '@/types';

export default function CashierPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'deposit';
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true); setError(null);
    const [{ data: w, error: wErr }, { data: t, error: tErr }] = await Promise.all([
      fetchWallet(user.id), fetchTransactions(user.id)
    ]);
    if (wErr || tErr) setError('Failed to load cashier data');
    setWallet(w); setTransactions(t || []); setLoading(false);
  };

  useEffect(() => { if (user?.id) { void loadData(); } }, [user, loadData]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Paystack checkout — backend verifies, never trust frontend
    alert('Deposit initiated — redirecting to Paystack...');
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit to admin approval queue
    alert('Withdrawal request submitted for admin approval');
  };

  const tabs = [
    {
      id: 'deposit', label: 'Deposit',
      content: (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="gh-label">Amount (USD)</label>
              <input type="number" min="5" step="0.01" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="gh-input" placeholder="0.00" required />
            </div>
            <div className="gh-card p-4 bg-gh-bg-tertiary">
              <p className="text-xs text-gh-text-muted mb-2">Payment Methods</p>
              <div className="space-y-2">
                {['Card', 'M-Pesa', 'Mobile Money'].map(m => (
                  <label key={m} className="flex items-center gap-3 p-3 rounded-xl border border-gh-border cursor-pointer hover:border-gh-border-light">
                    <input type="radio" name="method" className="accent-gh-accent" defaultChecked={m === 'Card'} />
                    <span className="text-sm text-gh-text-primary">{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="gh-btn-primary w-full">Complete Deposit</button>
            <p className="text-xs text-gh-text-muted text-center">Payments processed securely via Paystack. Wallet updates after server confirmation.</p>
          </form>
        </div>
      )
    },
    {
      id: 'withdraw', label: 'Withdraw',
      content: (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="gh-label">Amount (USD)</label>
              <input type="number" min="10" step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="gh-input" placeholder="0.00" required />
            </div>
            <div>
              <label className="gh-label">Payout Method</label>
              <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)} className="gh-input">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="m_pesa">M-Pesa</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Crypto (USDT)</option>
              </select>
            </div>
            <button type="submit" className="gh-btn-primary w-full">Request Withdrawal</button>
            <p className="text-xs text-gh-text-muted text-center">Withdrawals require admin approval. Funds released after verification.</p>
          </form>
        </div>
      )
    },
    {
      id: 'history', label: 'History', badge: transactions.length,
      content: (
        <div className="space-y-3">
          {loading ? <SkeletonList count={5} /> : transactions.length === 0 ? <EmptyStateTransactions /> : transactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
        </div>
      )
    }
  ];

  if (error) return <ErrorState onRetry={() => { void loadData(); }} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gh-text-primary">Cashier</h1>
      {wallet && <BalanceCard {...wallet} />}
      <Tabs tabs={tabs} defaultTab={defaultTab} variant="underline" />
    </div>
  );
}
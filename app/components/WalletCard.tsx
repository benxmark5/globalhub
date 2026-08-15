"use client";
import { useState, useEffect, type ReactElement } from 'react';
import {
  DollarSign, TrendingUp, Clock, ArrowDownCircle,
  ArrowUpCircle, RefreshCw, Bell, X, CheckCircle,
  ChevronRight, Plus, Minus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';
import { toLocalAmount, formatAmount } from '../lib/currency';

type Wallet = {
  id: string; available_balance: number;
  pending_balance: number; total_deposited: number;
  total_withdrawn: number; currency: string;
};

type Transaction = {
  id: string; type: string; amount: number;
  currency: string; status: string;
  reference: string; description: string;
  created_at: string;
};

type Notification = {
  id: string; type: string; title: string;
  message: string; is_read: boolean; created_at: string;
};

type WithdrawForm = {
  amount: string; payoutMethod: string;
  payoutName: string; payoutIdentifier: string;
};

interface Props {
  userId: string;
  userEmail: string;
}

export default function WalletCard({ userId, userEmail }: Props): ReactElement {
  const { currency } = useCurrency();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history' | 'notifications'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('card');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<WithdrawForm>({
    amount: '', payoutMethod: '', payoutName: '', payoutIdentifier: ''
  });
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/balance?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
        setNotifications(data.notifications || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Real-time wallet updates
    const channel = supabase
      .channel(`wallet-${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'wallets',
        filter: `user_id=eq.${userId}`
      }, () => load())
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 1) {
      setError('Minimum deposit is $1'); return;
    }
    setDepositLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, email: userEmail,
          amount: parseFloat(depositAmount),
          currency: currency.code,
          method: depositMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.authorizationUrl;
      } else {
        setError(data.error || 'Deposit failed');
      }
    } catch { setError('Connection error'); }
    setDepositLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) < 5) {
      setError('Minimum withdrawal is $5'); return;
    }
    if (!withdrawForm.payoutMethod || !withdrawForm.payoutName || !withdrawForm.payoutIdentifier) {
      setError('Please fill all payout details'); return;
    }
    if (!wallet || parseFloat(withdrawForm.amount) > wallet.available_balance) {
      setError('Insufficient balance'); return;
    }
    setWithdrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...withdrawForm, amount: parseFloat(withdrawForm.amount) }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawSuccess(true);
        setWithdrawForm({ amount: '', payoutMethod: '', payoutName: '', payoutIdentifier: '' });
        load();
      } else {
        setError(data.error || 'Withdrawal failed');
      }
    } catch { setError('Connection error'); }
    setWithdrawLoading(false);
  };

  const markAllRead = async () => {
    await fetch('/api/wallet/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const txIcon = (type: string) =>
    type === 'deposit' ? '+' : type === 'purchase' ? '🛒' : '−';

  const txColor = (type: string, status: string) =>
    status === 'failed' || status === 'rejected' ? '#f87171'
    : type === 'deposit' ? '#22c55e'
    : '#f87171';

  const statusBadge = (status: string) => ({
    background: status === 'completed' ? 'rgba(34,197,94,0.1)'
      : status === 'pending' ? 'rgba(251,191,36,0.1)'
      : 'rgba(239,68,68,0.1)',
    color: status === 'completed' ? '#22c55e'
      : status === 'pending' ? '#fbbf24'
      : '#f87171',
  });

  const unread = notifications.filter(n => !n.is_read).length;
  const bal = wallet?.available_balance || 0;
  const pending = wallet?.pending_balance || 0;
  const localBal = toLocalAmount(bal, currency);
  const localPending = toLocalAmount(pending, currency);

  const inputSt = {
    width: '100%', background: '#060f1e',
    border: '1.5px solid #1a2740', borderRadius: '10px',
    padding: '12px 14px', color: 'white', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      background: '#0f1f33', border: '1px solid #1a2740',
      borderRadius: '20px', overflow: 'hidden'
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1f12 0%, #0f1f33 100%)',
        padding: '20px',
        borderBottom: '1px solid #1a2740'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Available Balance
            </p>
            <p style={{ fontWeight: 900, fontSize: '32px', fontFamily: 'monospace', color: '#22c55e', lineHeight: 1 }}>
              {loading ? '...' : formatAmount(localBal, currency)}
            </p>
            <p style={{ color: '#374151', fontSize: '11px', marginTop: '4px' }}>
              = ${bal.toFixed(2)} USD
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <button type="button" onClick={load} style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', padding: '4px' }}>
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('notifications'); setError(''); }}
              style={{ position: 'relative', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#22c55e', touchAction: 'manipulation' }}
            >
              <Bell size={16} />
              {unread > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', fontSize: '9px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pending balance */}
        {pending > 0 && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#fbbf24" />
              <span style={{ color: '#fde68a', fontSize: '13px', fontWeight: 600 }}>Pending</span>
            </div>
            <span style={{ color: '#fbbf24', fontWeight: 900, fontFamily: 'monospace' }}>
              {formatAmount(localPending, currency)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button type="button" onClick={() => { setActiveTab('deposit'); setError(''); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            background: '#22c55e', color: 'black', border: 'none', borderRadius: '11px',
            padding: '13px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', touchAction: 'manipulation'
          }}>
            <Plus size={16} /> Deposit
          </button>
          <button type="button" onClick={() => { setActiveTab('withdraw'); setError(''); setWithdrawSuccess(false); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            background: '#0a1628', color: 'white', border: '1px solid #1a2740', borderRadius: '11px',
            padding: '13px', fontWeight: 900, fontSize: '14px', cursor: 'pointer', touchAction: 'manipulation'
          }}>
            <Minus size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '1px', background: '#1a2740', borderBottom: '1px solid #1a2740' }}>
        {(['overview', 'deposit', 'withdraw', 'history'] as const).map(tab => (
          <button key={tab} type="button"
            onClick={() => { setActiveTab(tab); setError(''); setWithdrawSuccess(false); }}
            style={{
              flex: 1, padding: '10px 4px', border: 'none',
              background: activeTab === tab ? '#0f1f33' : '#060f1e',
              color: activeTab === tab ? '#22c55e' : '#6b7280',
              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              touchAction: 'manipulation'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '18px' }}>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#f87171', fontSize: '13px' }}>⚠️ {error}</p>
            <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={14} /></button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Total Deposited', value: wallet?.total_deposited || 0, color: '#22c55e', icon: TrendingUp },
                { label: 'Total Withdrawn', value: wallet?.total_withdrawn || 0, color: '#f87171', icon: ArrowUpCircle },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{ background: '#060f1e', border: '1px solid #1a2740', borderRadius: '12px', padding: '14px' }}>
                    <Icon size={16} color={stat.color} style={{ marginBottom: '8px' }} />
                    <p style={{ fontWeight: 900, fontSize: '16px', fontFamily: 'monospace', color: stat.color }}>
                      {formatAmount(toLocalAmount(stat.value, currency), currency)}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent transactions */}
            <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
              Recent Activity
            </p>
            {transactions.length === 0 ? (
              <p style={{ color: '#374151', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No transactions yet</p>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a2740' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tx.type === 'deposit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      {tx.type === 'deposit' ? '↓' : tx.type === 'purchase' ? '🛒' : '↑'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px', color: 'white', textTransform: 'capitalize' }}>{tx.type}</p>
                      <p style={{ color: '#6b7280', fontSize: '11px' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, fontSize: '13px', fontFamily: 'monospace', color: txColor(tx.type, tx.status) }}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', ...statusBadge(tx.status) }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
            {transactions.length > 5 && (
              <button type="button" onClick={() => setActiveTab('history')} style={{ width: '100%', background: 'none', border: 'none', color: '#22c55e', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                View All Transactions <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── DEPOSIT ── */}
        {activeTab === 'deposit' && (
          <div>
            <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
              Add funds to your wallet. Your balance updates instantly after payment confirmation.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>
                Amount (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontWeight: 900, fontSize: '16px' }}>$</span>
                <input type="number" min="1" step="0.01" value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputSt, paddingLeft: '30px', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[5, 10, 25, 50].map(amt => (
                  <button key={amt} type="button" onClick={() => setDepositAmount(String(amt))}
                    style={{ flex: 1, background: depositAmount === String(amt) ? 'rgba(34,197,94,0.2)' : '#060f1e', border: `1px solid ${depositAmount === String(amt) ? '#22c55e' : '#1a2740'}`, borderRadius: '8px', padding: '7px', color: depositAmount === String(amt) ? '#22c55e' : '#6b7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'card', label: '💳 Card', sub: 'Visa / Mastercard' },
                  { id: 'mpesa', label: '📱 M-Pesa', sub: 'Mobile Money' },
                  { id: 'bank', label: '🏦 Bank Transfer', sub: 'Direct Transfer' },
                  { id: 'ussd', label: '📟 USSD', sub: 'Quick Pay' },
                ].map(m => (
                  <button key={m.id} type="button" onClick={() => setDepositMethod(m.id)}
                    style={{ padding: '12px', background: depositMethod === m.id ? 'rgba(34,197,94,0.1)' : '#060f1e', border: `1.5px solid ${depositMethod === m.id ? '#22c55e' : '#1a2740'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
                    <p style={{ color: depositMethod === m.id ? '#22c55e' : 'white', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{m.label}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px' }}>{m.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleDeposit} disabled={depositLoading || !depositAmount}
              style={{ width: '100%', background: !depositAmount || depositLoading ? '#1a2740' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: !depositAmount || depositLoading ? '#374151' : 'black', border: 'none', borderRadius: '12px', padding: '16px', fontWeight: 900, fontSize: '16px', cursor: depositLoading || !depositAmount ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: !depositAmount ? 'none' : '0 6px 20px rgba(34,197,94,0.25)', touchAction: 'manipulation' }}>
              {depositLoading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : `Deposit ${depositAmount ? `$${parseFloat(depositAmount || '0').toFixed(2)}` : ''}`}
            </button>

            <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
              🔒 SSL Encrypted · Secured by Paystack · Instant confirmation
            </p>
          </div>
        )}

        {/* ── WITHDRAW ── */}
        {activeTab === 'withdraw' && (
          <div>
            {withdrawSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '10px' }}>Request Submitted!</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your withdrawal request is pending admin review.
                  You'll be notified once it's approved (usually within 24 hours).
                </p>
                <button type="button" onClick={() => { setWithdrawSuccess(false); setActiveTab('history'); }}
                  style={{ background: '#22c55e', color: 'black', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: 900, cursor: 'pointer', touchAction: 'manipulation' }}>
                  View Transaction History
                </button>
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '18px', display: 'flex', gap: '10px' }}>
                  <Clock size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: '#fde68a', fontSize: '13px', lineHeight: 1.6 }}>
                    All withdrawals require admin approval. Available: <strong style={{ color: 'white' }}>${bal.toFixed(2)}</strong>
                  </p>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>Amount (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f87171', fontWeight: 900 }}>$</span>
                    <input type="number" min="5" max={bal} step="0.01"
                      value={withdrawForm.amount}
                      onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="Minimum $5"
                      style={{ ...inputSt, paddingLeft: '30px', fontSize: '16px', fontWeight: 900, fontFamily: 'monospace' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>Payout Method</label>
                  <select value={withdrawForm.payoutMethod}
                    onChange={e => setWithdrawForm(p => ({ ...p, payoutMethod: e.target.value }))}
                    style={inputSt}>
                    <option value="">Select method...</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="mpesa">📱 M-Pesa</option>
                    <option value="paypal">💙 PayPal</option>
                    <option value="wise">🌍 Wise (TransferWise)</option>
                    <option value="binance_pay">₿ Binance Pay</option>
                    <option value="usdt">💎 USDT (TRC20/ERC20)</option>
                    <option value="wave">🌊 Wave</option>
                    <option value="airtel_money">📱 Airtel Money</option>
                    <option value="mtn_mobile">📱 MTN Mobile Money</option>
                    <option value="western_union">🏢 Western Union</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>Account Name</label>
                    <input type="text" value={withdrawForm.payoutName}
                      onChange={e => setWithdrawForm(p => ({ ...p, payoutName: e.target.value }))}
                      placeholder="Full name on account"
                      style={inputSt} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '7px' }}>
                      {withdrawForm.payoutMethod === 'paypal' ? 'PayPal Email' : 'Account / Phone / ID'}
                    </label>
                    <input type="text" value={withdrawForm.payoutIdentifier}
                      onChange={e => setWithdrawForm(p => ({ ...p, payoutIdentifier: e.target.value }))}
                      placeholder={withdrawForm.payoutMethod === 'paypal' ? 'email@paypal.com' : '+254700000000'}
                      style={inputSt} />
                  </div>
                </div>

                <button type="button" onClick={handleWithdraw} disabled={withdrawLoading}
                  style={{ width: '100%', background: withdrawLoading ? '#1a2740' : '#0a1628', color: withdrawLoading ? '#374151' : 'white', border: '2px solid #1a2740', borderRadius: '12px', padding: '15px', fontWeight: 900, fontSize: '15px', cursor: withdrawLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', touchAction: 'manipulation' }}>
                  {withdrawLoading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : '→ Submit Withdrawal Request'}
                </button>
                <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
                  Requests reviewed within 24 hours · All amounts in USD
                </p>
              </>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === 'history' && (
          <div>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px' }}>
                <DollarSign size={36} color="#374151" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#374151', fontSize: '14px' }}>No transactions yet</p>
              </div>
            ) : (
              <div>
                {transactions.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a2740' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: tx.type === 'deposit' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        {tx.type === 'deposit' ? '↓' : tx.type === 'purchase' ? '🛒' : '↑'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '13px', color: 'white', textTransform: 'capitalize', marginBottom: '2px' }}>{tx.description || tx.type}</p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>{new Date(tx.created_at).toLocaleString()}</p>
                        <p style={{ color: '#374151', fontSize: '10px', fontFamily: 'monospace' }}>{tx.reference}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: '14px', fontFamily: 'monospace', color: txColor(tx.type, tx.status) }}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', ...statusBadge(tx.status) }}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </p>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '12px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px' }}>
                <Bell size={36} color="#374151" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#374151', fontSize: '14px' }}>No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: n.is_read ? 'transparent' : 'rgba(34,197,94,0.04)', border: `1px solid ${n.is_read ? 'transparent' : 'rgba(34,197,94,0.1)'}`, borderRadius: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>
                    {n.type === 'deposit_success' ? '💰' : n.type === 'withdrawal_submitted' ? '🔄' : n.type === 'withdrawal_approved' ? '✅' : n.type === 'withdrawal_rejected' ? '❌' : '🔔'}
                  </span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: n.is_read ? '#9ca3af' : 'white', marginBottom: '3px' }}>{n.title}</p>
                    <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ color: '#374151', fontSize: '10px', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
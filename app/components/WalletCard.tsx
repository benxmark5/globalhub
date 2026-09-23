// app/components/WalletCard.tsx
"use client";
import { useState, useEffect, type ReactElement } from 'react';
import {
  DollarSign, TrendingUp, Clock, ArrowUpCircle,
  RefreshCw, Bell, X, ChevronRight, Plus, Minus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/lib/useCurrency';
import { toLocalAmount, formatAmount } from '@/lib/currency';
import WalletWithdrawForm, { type WithdrawFormData } from './WalletWithdrawForm';
import AviatorTransferModal from './wallet/AviatorTransferModal';

// ── Internal transaction types that must NEVER be shown to the customer ──
const INTERNAL_TX_TYPES = new Set([
  'correction',
  'admin_adjustment',
  'admin_correction',
  'manual_fix',
  'internal',
]);

type Wallet = {
  id: string;
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  currency: string;
  aviator_balance?: number;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  description: string;
  created_at: string;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
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
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [aviatorBalance, setAviatorBalance] = useState(0);

  // ── Load wallet data ──
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/balance`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setAviatorBalance(Number(data.wallet?.aviator_balance ?? 0));

        // Filter out internal transaction types — customers must never see corrections/adjustments
        const rawTx: Transaction[] = data.transactions || [];
        setTransactions(rawTx.filter(tx => !INTERNAL_TX_TYPES.has(tx.type)));

        setNotifications(data.notifications || []);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    load();

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

  // ── Greeting ──
  useEffect(() => {
    const hour = new Date().getHours();
    const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    setGreeting(g);

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const metaName = user?.user_metadata?.full_name as string | undefined;
        if (metaName) {
          setUserName(metaName.split(' ')[0]);
          return;
        }
        const emailName = userEmail?.split('@')[0] || '';
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      } catch {
        setUserName('');
      }
    })();
  }, [userEmail]);

  // ── Deposit ──
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 1) {
      setError('Minimum deposit is $1');
      return;
    }
    setDepositLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
    } catch {
      setError('Connection error');
    }
    setDepositLoading(false);
  };

  // ── Withdraw ──
  const handleWithdraw = async (formData: WithdrawFormData) => {
    if (!wallet || parseFloat(formData.amount) > wallet.available_balance) {
      setError('Insufficient balance');
      return { success: false };
    }
    setWithdrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          payoutMethod: formData.payoutMethod,
          payoutName: formData.payoutName,
          payoutIdentifier: formData.payoutIdentifier,
          payoutExtra: formData.payoutExtra || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        load();
        setWithdrawLoading(false);
        return {
          success: true,
          reference: data.reference as string | undefined,
          expiresInSeconds: data.expiresInSeconds as number | undefined,
        };
      }
      setError(data.error || 'Withdrawal failed');
      setWithdrawLoading(false);
      return { success: false };
    } catch {
      setError('Connection error');
      setWithdrawLoading(false);
      return { success: false };
    }
  };

  // ── Notifications ──
  const markAllRead = async () => {
    await fetch('/api/wallet/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // ── Helpers ──

  // Friendly labels for transaction types
  const txLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'transfer': return 'Transfer';
      case 'crash_bet': return 'Aviator bet';
      case 'crash_payout': return 'Aviator win';
      case 'crash_bet_cancelled': return 'Aviator bet cancelled';
      case 'purchase': return 'Purchase';
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    }
  };

  // Colour rule: only failures are red. Everything else: green for credits, neutral for debits.
  const txColor = (amount: number, status: string) => {
    if (status === 'failed' || status === 'rejected') return '#f87171';
    if (status === 'pending') return '#fbbf24';
    return amount >= 0 ? '#22c55e' : '#9ca3af';
  };

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
    width: '100%',
    background: '#060f1e',
    border: '1.5px solid #1a2740',
    borderRadius: '10px',
    padding: '12px 14px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      background: '#0f1f33',
      border: '1px solid #1a2740',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1f12 0%, #0f1f33 100%)',
        padding: '20px',
        borderBottom: '1px solid #1a2740',
      }}>
        {greeting && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>
              {greeting}{userName ? `, ${userName}` : ''} 👋
            </p>
            <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

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

        {/* Action buttons — Deposit / Withdraw / Transfer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button type="button" onClick={() => { setActiveTab('deposit'); setError(''); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#22c55e', color: 'black', border: 'none', borderRadius: '11px',
            padding: '13px 8px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', touchAction: 'manipulation'
          }}>
            <Plus size={14} /> Deposit
          </button>
          <button type="button" onClick={() => { setActiveTab('withdraw'); setError(''); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: '#0a1628', color: 'white', border: '1px solid #1a2740', borderRadius: '11px',
            padding: '13px 8px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', touchAction: 'manipulation'
          }}>
            <Minus size={14} /> Withdraw
          </button>
          <button type="button" onClick={() => setShowTransfer(true)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: 'rgba(139,92,246,0.15)', color: '#c4b5fd',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: '11px',
            padding: '13px 8px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', touchAction: 'manipulation'
          }}>
            <RefreshCw size={14} /> Transfer
          </button>
        </div>

        {/* Aviator balance display */}
        {aviatorBalance > 0 && (
          <div style={{
            marginTop: 10,
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 700 }}>
              🎮 Aviator Wallet
            </span>
            <span style={{ color: '#c4b5fd', fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>
              ${aviatorBalance.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '1px', background: '#1a2740', borderBottom: '1px solid #1a2740' }}>
        {(['overview', 'deposit', 'withdraw', 'history'] as const).map(tab => (
          <button key={tab} type="button"
            onClick={() => { setActiveTab(tab); setError(''); }}
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

      {/* ── CONTENT ── */}
      <div style={{ padding: '18px' }}>

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

            <p style={{ color: '#6b7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
              Recent Activity
            </p>
            {transactions.length === 0 ? (
              <p style={{ color: '#374151', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No transactions yet</p>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a2740' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tx.amount >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      {tx.amount >= 0 ? '↓' : tx.type === 'purchase' ? '🛒' : '↑'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>{txLabel(tx.type)}</p>
                      <p style={{ color: '#6b7280', fontSize: '11px' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, fontSize: '13px', fontFamily: 'monospace', color: txColor(tx.amount, tx.status) }}>
                      {tx.amount >= 0 ? '+' : '−'}${Math.abs(tx.amount).toFixed(2)}
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
                  { id: 'card',   label: '💳 Card / Bank',  sub: 'Visa, Mastercard, Bank' },
                  { id: 'paypal', label: '💙 PayPal',       sub: 'Pay via PayPal' },
                ].map(m => (
                  <button key={m.id} type="button" onClick={() => setDepositMethod(m.id)}
                    style={{ padding: '12px', background: depositMethod === m.id ? 'rgba(34,197,94,0.1)' : '#060f1e', border: `1.5px solid ${depositMethod === m.id ? '#22c55e' : '#1a2740'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', touchAction: 'manipulation' }}>
                    <p style={{ color: depositMethod === m.id ? '#22c55e' : 'white', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{m.label}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px' }}>{m.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#f87171', fontSize: '13px' }}>⚠️ {error}</p>
                <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            )}

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
          <WalletWithdrawForm
            availableBalance={wallet?.available_balance || 0}
            submitting={withdrawLoading}
            error={error}
            onClearError={() => setError('')}
            onSubmit={handleWithdraw}
          />
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
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: tx.amount >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        {tx.amount >= 0 ? '↓' : tx.type === 'purchase' ? '🛒' : '↑'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '13px', color: 'white', marginBottom: '2px' }}>
                          {tx.description || txLabel(tx.type)}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>{new Date(tx.created_at).toLocaleString()}</p>
                        <p style={{ color: '#374151', fontSize: '10px', fontFamily: 'monospace' }}>{tx.reference}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: '14px', fontFamily: 'monospace', color: txColor(tx.amount, tx.status) }}>
                        {tx.amount >= 0 ? '+' : '−'}${Math.abs(tx.amount).toFixed(2)}
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

      {/* Aviator Transfer Modal */}
      {showTransfer && (
        <AviatorTransferModal
          open={showTransfer}
          onClose={() => setShowTransfer(false)}
          mainBalance={bal}
          aviatorBalance={aviatorBalance}
          onSuccess={load}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Send,
  History,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  DollarSign,
  Banknote,
  Building2,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';

type WalletData = {
  available_balance: number;
  pending_balance: number;
};

type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference: string;
  created_at: string;
};

export default function CashierPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTab, setSelectedTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('paystack');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: walletData } = await supabase
        .from('wallets')
        .select('available_balance, pending_balance')
        .eq('user_id', user.id)
        .single();

      setWallet(walletData);

      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(txData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Initialize Paystack payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: user?.email,
          reference: `GH-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Payment initialization failed');
        setProcessing(false);
        return;
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url;

    } catch (err) {
      setError('Failed to initialize payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-white/40">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <ArrowLeft size={20} className="text-white/60" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Cashier</h1>
            <p className="text-xs text-white/40">Manage your funds</p>
          </div>
          <button
            onClick={loadData}
            className="ml-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <RefreshCw size={16} className="text-white/40" />
          </button>
        </div>

        {/* Balance */}
        <div className="glass-card p-6">
          <p className="text-sm text-white/40">Total Balance</p>
          <p className="text-3xl font-bold text-white">
            ${wallet?.available_balance?.toFixed(2) || '0.00'}
          </p>
          {wallet?.pending_balance > 0 && (
            <p className="text-sm text-yellow-400 mt-1">
              Pending: ${wallet.pending_balance.toFixed(2)}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setSelectedTab('deposit')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                selectedTab === 'deposit'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setSelectedTab('withdraw')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                selectedTab === 'withdraw'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              Withdraw
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                selectedTab === 'history'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content based on tab */}
        {selectedTab === 'deposit' && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <label className="block text-sm text-white/60 mb-2">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                min="1"
                step="0.01"
              />
              <div className="flex gap-2 mt-3">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/40 hover:text-white transition"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <p className="text-sm text-white/60 mb-3">Payment Method</p>
              <div className="space-y-2">
                {[
                  { id: 'paystack', label: 'Paystack', icon: CreditCard, desc: 'Cards / Bank Transfer' },
                  { id: 'paypal', label: 'PayPal', icon: Globe, desc: 'International online payment' },
                  { id: 'bank', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                      selectedMethod === method.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <method.icon size={18} className="text-white/40" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{method.label}</p>
                      <p className="text-xs text-white/30">{method.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-white/20'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleDeposit}
              disabled={processing}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 rounded-xl font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Deposit Funds
                </>
              )}
            </button>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="glass-card p-8 text-center text-white/30">
                <History size={32} className="mx-auto mb-3 text-white/10" />
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-500/20' :
                      tx.type === 'withdrawal' ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {tx.type === 'deposit' ? (
                        <TrendingUp size={14} className="text-green-400" />
                      ) : tx.type === 'withdrawal' ? (
                        <TrendingDown size={14} className="text-red-400" />
                      ) : (
                        <Send size={14} className="text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize">{tx.type}</p>
                      <p className="text-[10px] text-white/30">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.type === 'deposit' ? 'text-green-400' :
                      tx.type === 'withdrawal' ? 'text-red-400' :
                      'text-blue-400'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                      tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
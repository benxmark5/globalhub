'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Ticket,
  ShoppingCart,
  User,
  Bell,
  Wallet,
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
  ChevronRight,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Send,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
  Crown,
  Sparkles,
  Shield,
  Award,
  Star,
  Football,
  Gamepad2,
  BarChart3,
  CalendarDays,
  ShoppingBag,
  History,
  Settings,
  HelpCircle,
  FileText,
  Lock,
  Activity
} from 'lucide-react';

type DashboardData = {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  wallet: {
    available_balance: number;
    pending_balance: number;
  };
  stats: {
    purchases: number;
    active: number;
    spent: number;
  };
  signalSummary: {
    footballBought: number;
    aviatorBought: number;
    totalCompleted: number;
    pending: number;
  };
  transactions: any[];
  purchaseHistory: any[];
  recentTransactions: any[];
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboardData = async () => {
    let userId = user?.id;
    
    if (!userId) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          userId = sessionData.session.user.id;
        }
      } catch (e) {
        console.log('No session found');
      }
    }

    if (!userId) {
      setLoading(false);
      setError('Please sign in to view your dashboard');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      // 2. Get wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('available_balance, pending_balance')
        .eq('user_id', userId)
        .maybeSingle();

      // 3. Get all purchases for stats
      const { data: allPurchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId);

      // 4. Calculate signal summary
      const footballPurchases = allPurchases?.filter(p => p.signal_type === 'football') || [];
      const aviatorPurchases = allPurchases?.filter(p => p.signal_type === 'aviator') || [];
      const completed = allPurchases?.filter(p => p.status === 'completed') || [];
      const pending = allPurchases?.filter(p => p.status === 'pending' || !p.status) || [];

      const totalSpent = allPurchases?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // 5. Get transactions
      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // 6. Get recent transactions for display
      const recentTx = transactions?.slice(0, 4) || [];

      setData({
        user: {
          id: userId,
          full_name: profile?.full_name || 'User',
          email: profile?.email || user?.email || '',
          avatar_url: profile?.avatar_url || null,
        },
        wallet: {
          available_balance: wallet?.available_balance || 0,
          pending_balance: wallet?.pending_balance || 0,
        },
        stats: {
          purchases: allPurchases?.length || 0,
          active: pending.length,
          spent: totalSpent,
        },
        signalSummary: {
          footballBought: footballPurchases.length,
          aviatorBought: aviatorPurchases.length,
          totalCompleted: completed.length,
          pending: pending.length,
        },
        transactions: transactions || [],
        purchaseHistory: allPurchases?.slice(0, 5) || [],
        recentTransactions: recentTx,
      });

    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-purple-400 font-bold text-xs">GH</div>
        </div>
        <span className="mt-4 text-white/40 text-sm">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-white/40 text-sm text-center max-w-sm">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-bold hover:opacity-80 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-4">
        <User className="w-12 h-12 text-white/20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Welcome to GlobalHub</h2>
        <p className="text-white/40 text-sm text-center max-w-sm">Sign in to access your dashboard</p>
        <Link href="/auth/login">
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-bold hover:opacity-80 transition">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">GH</span>
            </div>
            <span className="font-black text-lg gradient-text">GlobalHub</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-lg hover:bg-white/5 transition">
              <Bell size={18} className="text-white/40" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-bold bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                3
              </span>
            </button>
            <button
              onClick={loadDashboardData}
              className="p-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <RefreshCw size={16} className="text-white/30 hover:text-white/60 transition" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                {data.user.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center">
                <span className="text-[8px]">📷</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white truncate">{data.user.full_name}</p>
                <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Star size={10} className="text-yellow-400" />
                </div>
              </div>
              <p className="text-xs text-white/40 truncate">{data.user.email}</p>
              <p className="text-[10px] text-white/20">Tap avatar to change photo</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Purchases</p>
              <p className="text-lg font-bold text-blue-400">{data.stats.purchases}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Active</p>
              <p className="text-lg font-bold text-green-400">{data.stats.active}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Spent</p>
              <p className="text-lg font-bold text-yellow-400">${data.stats.spent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/football" className="glass-card p-4 hover:glass-card-hover transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-lg">⚽</span>
              </div>
              <div>
                <p className="font-bold text-sm">Football</p>
                <p className="text-[10px] text-white/30">From $1.20</p>
              </div>
            </div>
          </Link>
          <Link href="/aviator/game" className="glass-card p-4 hover:glass-card-hover transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-400 flex items-center justify-center">
                <span className="text-lg">✈️</span>
              </div>
              <div>
                <p className="font-bold text-sm">Aviator</p>
                <p className="text-[10px] text-white/30">From $3</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Buy Today's Signals */}
        <Link href="/odds-master">
          <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-bold text-black transition shadow-lg shadow-yellow-500/20">
            BUY TODAY'S SIGNALS
          </button>
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {['overview', 'wallet', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="glass-card p-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Signal Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Football Signals Bought</span>
                  <span className="text-sm font-bold text-white">{data.signalSummary.footballBought}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Aviator Signals Bought</span>
                  <span className="text-sm font-bold text-white">{data.signalSummary.aviatorBought}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Total Completed</span>
                  <span className="text-sm font-bold text-green-400">{data.signalSummary.totalCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Pending</span>
                  <span className="text-sm font-bold text-yellow-400">{data.signalSummary.pending}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-bold text-yellow-400">${data.stats.spent.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-3">
            <div className="glass-card p-4">
              <p className="text-sm text-white/40">Available Balance</p>
              <p className="text-2xl font-bold text-white">${data.wallet.available_balance.toFixed(2)}</p>
              {data.wallet.pending_balance > 0 && (
                <p className="text-xs text-yellow-400 mt-1">Pending: ${data.wallet.pending_balance.toFixed(2)}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Link href="/cashier/deposit" className="flex-1">
                  <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-bold text-sm hover:opacity-80 transition">
                    Deposit
                  </button>
                </Link>
                <Link href="/cashier/withdraw" className="flex-1">
                  <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 font-bold text-sm transition border border-white/5">
                    Withdraw
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Recent Transactions</p>
                <Link href="/cashier?tab=history">
                  <button className="text-[10px] text-white/20 hover:text-white/40 transition">View All</button>
                </Link>
              </div>
              {data.recentTransactions.length === 0 ? (
                <div className="text-center py-2 text-white/20 text-sm">
                  No transactions yet
                </div>
              ) : (
                data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-bold capitalize">{tx.type}</p>
                      <p className="text-xs text-white/30">{tx.reference || 'N/A'}</p>
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
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="glass-card p-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Purchase History</p>
            {data.purchaseHistory.length === 0 ? (
              <div className="text-center py-4 text-white/20 text-sm">
                No purchase history yet
              </div>
            ) : (
              data.purchaseHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.signal_type === 'aviator' ? '✈️ Aviator' : '⚽ Football'} Signal(s)
                    </p>
                    <p className="text-xs text-white/30">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">KES {item.amount}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <Link href="/">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition text-white/30 hover:text-white/60">
                <Home size={20} />
                <span className="text-[8px] font-medium">Dashboard</span>
              </button>
            </Link>
            <Link href="/cashier?tab=history">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition text-white/30 hover:text-white/60">
                <History size={20} />
                <span className="text-[8px] font-medium">Transactions</span>
              </button>
            </Link>
            <Link href="/quick-action">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition text-purple-400">
                <Activity size={20} />
                <span className="text-[8px] font-medium text-purple-400">Quick Action</span>
              </button>
            </Link>
            <Link href="/support">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition text-white/30 hover:text-white/60">
                <HelpCircle size={20} />
                <span className="text-[8px] font-medium">Support</span>
              </button>
            </Link>
            <Link href="/account">
              <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition text-white/30 hover:text-white/60">
                <User size={20} />
                <span className="text-[8px] font-medium">Profile</span>
              </button>
            </Link>
          </div>
        </div>
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
        .glass-card-hover:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #8B5CF6, #3B82F6, #06B6D4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
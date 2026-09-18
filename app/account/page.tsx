// app/account/page.tsx
"use client";

import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import WalletCard from '../components/WalletCard';
import { supabase } from '@/lib/supabase';
import {
  Camera, User, Bell, TrendingUp, Zap,
  ArrowRight, Sparkles, Clock,
} from 'lucide-react';
interface AccountUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; avatar_url?: string };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  description: string;
  created_at: string;
}

export default function AccountPage(): ReactElement {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<AccountUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  // ── Init: load user + wallet + recent transactions ──
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      if (!u) { router.push('/login'); return; }

      setUser({
        id: u.id,
        email: u.email,
        user_metadata: u.user_metadata as AccountUser['user_metadata'],
      });
      setAvatarUrl(u.user_metadata?.avatar_url || null);

      // Greeting
      const hour = new Date().getHours();
      setGreeting(
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
      );

      // Load wallet + transactions
      try {
        const [walletRes, txRes] = await Promise.all([
          supabase
            .from('wallets')
            .select('available_balance, pending_balance')
            .eq('user_id', u.id)
            .maybeSingle(),
          supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', u.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const w = walletRes.data as { available_balance?: number; pending_balance?: number } | null;
        setWalletBalance(w?.available_balance ?? 0);
        setPendingBalance(w?.pending_balance ?? 0);
        setTransactions((txRes.data ?? []) as Transaction[]);
      } catch (e) {
        console.error('[account] load failed:', e);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  // ── Avatar upload ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      setAvatarUrl(publicUrl);
    } catch (e) {
      console.error('Avatar upload failed:', e);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
      }}>
        Loading...
      </div>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const initials = (user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '24px 16px 32px',
    }}>

      {/* ── Header: greeting + bell ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: '#9ca3af',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 4,
          }}>
            {greeting}, {firstName} 👋
          </p>
          <p style={{
            color: '#4b5563',
            fontSize: 12,
          }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        <Link
          href="/notifications"
          style={{
            position: 'relative',
            width: 42,
            height: 42,
            background: '#0f1f33',
            border: '1px solid #1a2740',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          aria-label="Notifications"
        >
          <Bell size={18} color="#9ca3af" />
        </Link>
      </div>

      {/* ── Profile card ── */}
      <div style={{
        background: '#0f1f33',
        border: '1px solid #1a2740',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2px solid #22c55e',
              overflow: 'hidden',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                unoptimized
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 22 }}>
                {initials}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 24,
              height: 24,
              background: '#22c55e',
              borderRadius: '50%',
              border: '2px solid #0f1f33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Change avatar"
          >
            {uploadingAvatar ? (
              <span style={{ fontSize: 10 }}>…</span>
            ) : (
              <Camera size={12} color="black" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 900,
            fontSize: 18,
            color: 'white',
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.user_metadata?.full_name || 'Welcome!'}
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* ── Wallet (integrated) ── */}
      {user && <WalletCard userId={user.id} userEmail={user.email || ''} />}

      {/* ── Recent Transactions ── */}
      {transactions.length > 0 && (
        <div style={{
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: 20,
          padding: 20,
          marginTop: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <p style={{
              color: '#9ca3af',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Recent Activity
            </p>
            <Link
              href="/account?tab=history"
              style={{
                color: '#22c55e',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {transactions.slice(0, 5).map((tx) => {
            const isCredit = tx.type === 'deposit' || tx.amount > 0;
            const icon = tx.type === 'deposit' ? '↓'
              : tx.type === 'withdrawal' ? '↑'
              : tx.type === 'purchase' ? '🛒'
              : '•';
            return (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #1a2740',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: tx.type === 'deposit' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      marginBottom: 2,
                    }}>
                      {tx.description || tx.type}
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: 11,
                    }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    color: isCredit ? '#22c55e' : '#f87171',
                    fontSize: 13,
                    fontWeight: 900,
                    fontFamily: 'monospace',
                  }}>
                    {isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: tx.status === 'completed' ? 'rgba(34,197,94,0.12)'
                      : tx.status === 'pending' ? 'rgba(251,191,36,0.12)'
                      : 'rgba(239,68,68,0.12)',
                    color: tx.status === 'completed' ? '#22c55e'
                      : tx.status === 'pending' ? '#fbbf24'
                      : '#f87171',
                  }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

     
            

    </div>
  );
}
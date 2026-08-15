"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCircle, ArrowLeft,
  DollarSign, ShoppingBag, AlertTriangle, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Notif = {
  id: string; type: string; title: string;
  message: string; is_read: boolean; created_at: string;
};

const ICONS: Record<string, { icon: string; color: string }> = {
  deposit_success:     { icon: '💰', color: '#22c55e' },
  withdrawal_submitted:{ icon: '🔄', color: '#fbbf24' },
  withdrawal_approved: { icon: '✅', color: '#22c55e' },
  withdrawal_rejected: { icon: '❌', color: '#f87171' },
  purchase_success:    { icon: '🎉', color: '#22c55e' },
  signal_dispatched:   { icon: '📡', color: '#60a5fa' },
  default:             { icon: '🔔', color: '#6b7280' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.push('/login'); return; }
      setUser(session.user);
      loadNotifications(session.user.id);
    });
  }, []);

  const loadNotifications = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs(data || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{
      minHeight: '100dvh', background: '#060f1e', color: 'white',
      fontFamily: '-apple-system, sans-serif', paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid #1a2740', padding: '14px 16px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', touchAction: 'manipulation' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '18px' }}>Notifications</h1>
              {unread > 0 && <p style={{ color: '#22c55e', fontSize: '12px' }}>{unread} unread</p>}
            </div>
          </div>
          {unread > 0 && (
            <button type="button" onClick={markAllRead}
              style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '13px', fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Bell size={36} color="#374151" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#374151' }}>Loading...</p>
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#0a1628', borderRadius: '20px', border: '1px solid #1a2740' }}>
            <Bell size={52} color="#374151" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 900, fontSize: '20px', marginBottom: '8px' }}>All Caught Up!</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>You have no notifications right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifs.map(n => {
              const meta = ICONS[n.type] || ICONS.default;
              return (
                <div key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    background: n.is_read ? '#0a1628' : 'rgba(34,197,94,0.04)',
                    border: `1px solid ${n.is_read ? '#1a2740' : 'rgba(34,197,94,0.15)'}`,
                    borderRadius: '14px', padding: '14px',
                    cursor: n.is_read ? 'default' : 'pointer',
                    position: 'relative'
                  }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `${meta.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: n.is_read ? 600 : 900, fontSize: '14px', color: n.is_read ? '#9ca3af' : 'white', marginBottom: '4px' }}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                    )}
                    <p style={{ color: '#374151', fontSize: '11px', marginTop: '5px' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {!n.is_read && (
                      <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', marginTop: '4px' }} />
                    )}
                    <button type="button"
                      onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                      style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', padding: '2px', touchAction: 'manipulation' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
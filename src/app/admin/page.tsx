'use client';
import { useEffect, useState } from 'react';
import { DashboardCard } from '@/components/cards/DashboardCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/client';
import type { DashboardStats } from '@/types';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      // Aggregate from Supabase — replace with your RPC or edge function
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: orders } = await supabase.from('purchases').select('*', { count: 'exact', head: true });
      const { count: pendingW } = await supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      setStats({
        total_users: users || 0, total_revenue: 0, today_revenue: 0,
        total_orders: orders || 0, active_signals: 0, pending_withdrawals: pendingW || 0, live_visitors: 0
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gh-text-primary">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : (
          <>
            <DashboardCard title="Total Users" value={stats?.total_users || 0} icon={<span className="text-lg">👥</span>} color="accent" />
            <DashboardCard title="Total Orders" value={stats?.total_orders || 0} icon={<span className="text-lg">📦</span>} color="info" />
            <DashboardCard title="Pending Withdrawals" value={stats?.pending_withdrawals || 0} icon={<span className="text-lg">⏳</span>} color="warning" href="/admin/withdrawals" />
            <DashboardCard title="Live Visitors" value={stats?.live_visitors || 0} icon={<span className="text-lg">👁</span>} color="success" />
          </>
        )}
      </div>
    </div>
  );
}

// app/components/football/FootballTab.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { supabase } from '@/lib/supabase';
import SignalCard, { type FootballSignal, type PurchasedInfo } from './SignalCard';
import SlipModal from './SlipModal';
import { Loader2, Search, AlertCircle } from 'lucide-react';

export default function FootballTab(): ReactElement {
  const [signals, setSignals] = useState<FootballSignal[]>([]);
  const [purchased, setPurchased] = useState<Record<string, PurchasedInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'today' | 'tomorrow' | 'all'>('upcoming');
  const [username, setUsername] = useState('Friend');
  const [successSignal, setSuccessSignal] = useState<FootballSignal | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Load published markets
      const { data: markets, error: mErr } = await supabase
        .from('football_markets')
        .select('id, league, country, home_team, away_team, home_logo, away_logo, kickoff_at, venue, market_type, market_line, pick, odds, confidence, price_usd, code, status, is_featured')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('kickoff_at', { ascending: true })
        .limit(80);

      if (mErr) throw mErr;
      setSignals((markets ?? []) as FootballSignal[]);

      // Load user's purchases + name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const nameFromMeta = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0];
        setUsername(nameFromMeta || user.email?.split('@')[0] || 'Friend');

        const { data: purchases } = await supabase
          .from('football_purchases')
          .select('id, market_id, reference, created_at')
          .eq('user_id', user.id);

        const map: Record<string, PurchasedInfo> = {};
        (purchases ?? []).forEach((p: { id: string; market_id: string; reference: string; created_at: string }) => {
          map[p.market_id] = {
            purchase_id: p.id,
            reference: p.reference,
            purchased_at: p.created_at,
          };
        });
        setPurchased(map);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh every 60s (new signals may appear)
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const handleBuy = async (marketId: string) => {
    try {
      const res = await fetch('/api/football/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Purchase failed' };
      }

      // Reload to fetch updated purchases
      await load();

      // Show slip modal
      const signal = signals.find(s => s.id === marketId) || null;
      if (signal) setSuccessSignal(signal);

      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error' };
    }
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const tomorrowStart = todayEnd;
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 86400000);

    return signals.filter(s => {
      const search2 = search.toLowerCase().trim();
      if (search2 && !(
        s.home_team.toLowerCase().includes(search2) ||
        s.away_team.toLowerCase().includes(search2) ||
        s.league.toLowerCase().includes(search2)
      )) return false;

      const kickoff = new Date(s.kickoff_at).getTime();
      if (dateFilter === 'today') {
        if (kickoff < todayStart.getTime() || kickoff >= todayEnd.getTime()) return false;
      } else if (dateFilter === 'tomorrow') {
        if (kickoff < tomorrowStart.getTime() || kickoff >= tomorrowEnd.getTime()) return false;
      } else if (dateFilter === 'upcoming') {
        if (kickoff < now) return false;
      }
      return true;
    });
  }, [signals, search, dateFilter]);

  // Group by league
  const byLeague = useMemo(() => {
    const groups: Record<string, FootballSignal[]> = {};
    filtered.forEach(s => {
      if (!groups[s.league]) groups[s.league] = [];
      groups[s.league].push(s);
    });
    return groups;
  }, [filtered]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search team or league..."
            style={{
              width: '100%',
              background: '#0a1628',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '11px 12px 11px 36px',
              color: 'white',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value as typeof dateFilter)}
          style={{
            background: '#0a1628',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '11px 14px',
            color: 'white',
            fontSize: 14,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="upcoming">Upcoming</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <AlertCircle size={16} color="#f87171" />
          <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Content */}
      {loading && signals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Loader2 size={26} color="#22c55e" className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 13 }}>Loading signals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#0a1628',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 15 }}>
            No signals available right now
          </p>
          <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
            Check back soon — new signals are published throughout the day.
          </p>
        </div>
      ) : (
        Object.entries(byLeague).map(([league, leagueSignals]) => (
          <div key={league} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h3 style={{ color: 'white', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {league}
              </h3>
              <span style={{ color: '#475569', fontSize: 12 }}>{leagueSignals.length}</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}>
              {leagueSignals.map(s => (
                <SignalCard
                  key={s.id}
                  signal={s}
                  purchase={purchased[s.id] || null}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Slip modal */}
      {successSignal && (
        <SlipModal
          open={!!successSignal}
          onClose={() => setSuccessSignal(null)}
          signal={successSignal}
          username={username}
        />
      )}
    </div>
  );
}
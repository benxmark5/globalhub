// app/components/aviator/AviatorTab.tsx
"use client";

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, CheckCircle, Loader2, Zap, Clock } from 'lucide-react';
import AviatorSlipModal from './AviatorSlipModal';

type Batch = {
  id: string;
  name: string | null;
  signal_count: number | null;
  price_usd: number | null;
  status: string;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  sample_size: number | null;
  volatility: string | null;
  trend: string | null;
  purchases_count: number;
};

type PurchaseInfo = {
  id: string;
  reference: string;
  created_at: string;
};

type SignalRow = {
  id: string;
  batch_id: string;
  entry_point: number;
  exit_point: number;
  confidence: number;
  risk_level: string;
  signal_notes: string | null;
  position: number;
};

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  HIGH: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function AviatorTab(): ReactElement {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [purchased, setPurchased] = useState<Record<string, PurchaseInfo>>({});
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchSignals, setBatchSignals] = useState<Record<string, SignalRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [username, setUsername] = useState('Friend');
  const [confirmBatch, setConfirmBatch] = useState<Batch | null>(null);
  const [slipData, setSlipData] = useState<{
    packName: string;
    reference: string;
    price: number;
    signals: SignalRow[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: batchData, error: bErr } = await supabase
        .from('public_aviator_batches')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (bErr) throw bErr;
      setBatches((batchData ?? []) as Batch[]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const nameFromMeta = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0];
        setUsername(nameFromMeta || user.email?.split('@')[0] || 'Friend');

        const { data: purchases } = await supabase
          .from('aviator_purchases')
          .select('id, batch_id, reference, created_at')
          .eq('user_id', user.id);

        const map: Record<string, PurchaseInfo> = {};
        (purchases ?? []).forEach((p: { id: string; batch_id: string; reference: string; created_at: string }) => {
          map[p.batch_id] = { id: p.id, reference: p.reference, created_at: p.created_at };
        });
        setPurchased(map);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load packs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const toggleSignals = async (batchId: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    if (batchSignals[batchId]) return;
    try {
      const { data } = await supabase
        .from('aviator_signals')
        .select('*')
        .eq('batch_id', batchId)
        .order('position');
      setBatchSignals(prev => ({ ...prev, [batchId]: (data ?? []) as SignalRow[] }));
    } catch { /* silent */ }
  };

  const handleBuy = async (batchId: string) => {
    setBusyId(batchId);
    setError('');
    try {
      const res = await fetch('/api/aviator/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Purchase failed');
        return;
      }

      const batch = confirmBatch;
      setConfirmBatch(null);

      // Reload purchases
      await load();

      // Load signals for slip
      const { data: sigs } = await supabase
        .from('aviator_signals')
        .select('*')
        .eq('batch_id', batchId)
        .order('position');

      // Show slip
      if (batch && sigs) {
        setSlipData({
          packName: batch.name || 'Aviator Pack',
          reference: data.reference || '',
          price: Number(batch.price_usd ?? 0),
          signals: sigs as SignalRow[],
        });
      }

      // Cache signals for the card
      setBatchSignals(prev => ({ ...prev, [batchId]: (sigs ?? []) as SignalRow[] }));
      setExpandedBatch(batchId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && batches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Loader2 size={26} color="#22c55e" className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontSize: 13 }}>Loading packs...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 14,
        }}>
          <p style={{ color: '#f87171', fontSize: 13 }}>⚠️ {error}</p>
        </div>
      )}

      {batches.length === 0 ? (
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
        }}>
          <Zap size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 15 }}>
            No packs available right now
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6 }}>
            New Aviator packs drop regularly — check back soon.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {batches.map(b => {
            const purchase = purchased[b.id];
            const isPurchased = !!purchase;
            const expired = b.expires_at ? new Date(b.expires_at).getTime() < Date.now() : false;
            const expanded = expandedBatch === b.id;
            const sigs = batchSignals[b.id] ?? [];

            return (
              <div
                key={b.id}
                style={{
                  background: isPurchased ? 'rgba(34,197,94,0.06)' : 'var(--surface)',
                  border: isPurchased ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-strong)',
                  borderRadius: 16,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header */}
                <div>
                  <p style={{
                    color: 'var(--brand)',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    Aviator Pack
                  </p>
                  <p style={{
                    color: 'var(--text)',
                    fontSize: 15,
                    fontWeight: 800,
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {b.name || 'Unnamed Pack'}
                  </p>
                </div>

                {/* Signal count */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
                  <span style={{
                    background: 'rgba(34,197,94,0.12)',
                    color: '#86efac',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontWeight: 700,
                  }}>
                    <Zap size={10} style={{ display: 'inline', marginRight: 4 }} />
                    {b.signal_count} signals
                  </span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    color: 'var(--brand)',
                    fontWeight: 900,
                    fontSize: 26,
                    fontFamily: 'monospace',
                  }}>
                    ${b.price_usd?.toFixed(2)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>USD</span>
                </div>

                {/* Purchase state / Buy button */}
                {isPurchased ? (
                  <>
                    <div style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.25)',
                      borderRadius: 10,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <CheckCircle size={14} color="var(--brand)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'var(--brand)', fontSize: 11, fontWeight: 700 }}>
                          Purchased
                        </p>
                        <p style={{
                          color: 'var(--text-dim)',
                          fontSize: 10,
                          fontFamily: 'monospace',
                          marginTop: 1,
                        }}>
                          {purchase.reference}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSignals(b.id)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text)',
                        borderRadius: 10,
                        padding: '10px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {expanded ? '▲ Hide signals' : '▼ Show signals'}
                    </button>

                    {expanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sigs.length === 0 ? (
                          <p style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', padding: 8 }}>
                            Loading signals...
                          </p>
                        ) : (
                          sigs.map((s, i) => (
                            <div
                              key={s.id}
                              style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: 10,
                                fontSize: 12,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>#{i + 1}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${RISK_COLORS[s.risk_level] || 'bg-white/5 text-white/60 border-white/10'}`}>
                                  {s.risk_level}
                                </span>
                              </div>
                              <p style={{ color: 'var(--text)', fontWeight: 800, fontFamily: 'monospace', fontSize: 14 }}>
                                Exit at {s.exit_point}x
                              </p>
                              <p style={{ color: 'var(--text-dim)', fontSize: 10, marginTop: 2 }}>
                                {s.confidence}% confidence
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : expired ? (
                  <button
                    type="button"
                    disabled
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--border)',
                      borderRadius: 11,
                      padding: 12,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'not-allowed',
                      marginTop: 'auto',
                    }}
                  >
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Expired
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmBatch(b)}
                    disabled={busyId === b.id}
                    style={{
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      color: 'black',
                      border: 'none',
                      borderRadius: 11,
                      padding: 12,
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: busyId === b.id ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 'auto',
                    }}
                  >
                    {busyId === b.id ? (
                      <><Loader2 size={14} className="animate-spin" /> Processing...</>
                    ) : (
                      <><Lock size={14} /> Buy Pack — ${b.price_usd?.toFixed(2)}</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmBatch && (
        <div
          onClick={() => busyId === null && setConfirmBatch(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 18,
              padding: 22,
              maxWidth: 380,
              width: '100%',
            }}
          >
            <h3 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
              Confirm Purchase
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              You&apos;re about to buy this Aviator pack
            </p>

            <div style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
            }}>
              <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                {confirmBatch.name || 'Unnamed Pack'}
              </p>
              <p style={{ color: '#86efac', fontSize: 12 }}>
                {confirmBatch.signal_count} signals
              </p>
            </div>

            <p style={{
              color: '#fbbf24',
              fontSize: 13,
              marginBottom: 20,
              textAlign: 'center',
              fontWeight: 700,
            }}>
              ${confirmBatch.price_usd?.toFixed(2)} USD will be deducted from your wallet.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmBatch(null)}
                disabled={busyId !== null}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  borderRadius: 11,
                  padding: 12,
                  fontWeight: 700,
                  cursor: busyId === null ? 'pointer' : 'not-allowed',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBuy(confirmBatch.id)}
                disabled={busyId !== null}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  border: 'none',
                  color: 'black',
                  borderRadius: 11,
                  padding: 12,
                  fontWeight: 900,
                  cursor: busyId === null ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {busyId !== null
                  ? <><Loader2 size={14} className="animate-spin" /> Buying...</>
                  : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip modal */}
      {slipData && (
        <AviatorSlipModal
          open={!!slipData}
          onClose={() => setSlipData(null)}
          packName={slipData.packName}
          reference={slipData.reference}
          price={slipData.price}
          signals={slipData.signals}
          username={username}
        />
      )}
    </div>
  );
}
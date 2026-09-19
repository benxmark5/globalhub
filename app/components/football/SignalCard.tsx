// app/components/football/SignalCard.tsx
"use client";

import { useState, type ReactElement } from 'react';
import { Lock, CheckCircle, Loader2, TrendingUp, Clock } from 'lucide-react';

export type FootballSignal = {
  id: string;
  league: string;
  country: string | null;
  home_team: string;
  away_team: string;
  home_logo: string | null;
  away_logo: string | null;
  kickoff_at: string;
  venue: string | null;
  market_type: string;
  market_line: string | null;
  pick: string;
  odds: number;
  confidence: number | null;
  price_usd: number;
  code: string;
  status: string;
  is_featured: boolean;
};

export type PurchasedInfo = {
  purchase_id: string;
  reference: string;
  purchased_at: string;
};

interface Props {
  signal: FootballSignal;
  /** If already purchased, unlock the details. */
  purchase?: PurchasedInfo | null;
  /** Called when user confirms buy. Should resolve with { success: boolean; error?: string }. */
  onBuy: (signalId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SignalCard({ signal, purchase, onBuy }: Props): ReactElement {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isPurchased = !!purchase;
  const kickoff = new Date(signal.kickoff_at);
  const isPast = kickoff.getTime() < Date.now();

  const handleBuyClick = () => {
    if (isPurchased) return;
    setError('');
    setShowConfirm(true);
  };

  const confirmBuy = async () => {
    setBusy(true);
    setError('');
    const result = await onBuy(signal.id);
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'Purchase failed');
      return;
    }
    setShowConfirm(false);
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          background: signal.is_featured
            ? 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, #0f1f33 60%)'
            : '#0f1f33',
          border: signal.is_featured
            ? '1px solid rgba(34,197,94,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Header: League + kickoff */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {signal.league}
            </p>
            {signal.venue && (
              <p style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                {signal.venue}
              </p>
            )}
          </div>
          {signal.is_featured && (
            <span style={{
              background: 'rgba(251,191,36,0.15)',
              color: '#fbbf24',
              fontSize: 9,
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: 6,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              ⚡ Featured
            </span>
          )}
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {signal.home_logo ? (
            <img src={signal.home_logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚽</div>
          )}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
              {signal.home_team}
            </p>
            <p style={{ color: '#64748b', fontSize: 10, fontWeight: 700, marginTop: 4 }}>VS</p>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>
              {signal.away_team}
            </p>
          </div>
          {signal.away_logo ? (
            <img src={signal.away_logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚽</div>
          )}
        </div>

        {/* Kickoff time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>
          <Clock size={12} />
          {kickoff.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Market + confidence */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#cbd5e1' }}>
            {signal.market_type.replace(/_/g, ' ')}
            {signal.market_line ? ` · ${signal.market_line}` : ''}
          </span>
          {signal.confidence !== null && (
            <span style={{ background: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#86efac', fontWeight: 700 }}>
              <TrendingUp size={10} style={{ display: 'inline', marginRight: 4 }} />
              {signal.confidence}% confidence
            </span>
          )}
        </div>

        {/* Locked vs Unlocked */}
        {isPurchased ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 12,
            padding: 12,
          }}>
            <p style={{ color: '#86efac', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              <CheckCircle size={11} style={{ display: 'inline', marginRight: 4 }} />
              Your Pick
            </p>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 900, marginBottom: 8 }}>
              {signal.pick}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>Odds:</span>
              <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>{signal.odds}</span>
              <span style={{ color: '#475569' }}>·</span>
              <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{signal.code}</span>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: 14,
            textAlign: 'center',
          }}>
            <Lock size={20} color="#64748b" style={{ margin: '0 auto 6px' }} />
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700 }}>
              Pick hidden
            </p>
            <p style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
              Buy to reveal the selection & code
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            padding: 10,
          }}>
            <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>
          </div>
        )}

        {/* Buy button */}
        {!isPurchased && (
          <button
            type="button"
            onClick={handleBuyClick}
            disabled={busy || isPast}
            style={{
              background: busy ? '#1a2740' : 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: busy ? '#374151' : 'black',
              border: 'none',
              borderRadius: 11,
              padding: '12px',
              fontWeight: 900,
              fontSize: 14,
              cursor: busy || isPast ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 'auto',
            }}
          >
            {busy ? (
              <><Loader2 size={14} className="animate-spin" /> Processing...</>
            ) : isPast ? (
              'Match started'
            ) : (
              `Buy Signal — $${signal.price_usd.toFixed(2)}`
            )}
          </button>
        )}

        {isPurchased && (
          <div style={{
            textAlign: 'center',
            color: '#86efac',
            fontSize: 11,
            fontWeight: 700,
            padding: '6px 0',
          }}>
            <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
            Purchased · {new Date(purchase!.purchased_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          onClick={() => !busy && setShowConfirm(false)}
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
              background: '#0f1f33',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              padding: 22,
              maxWidth: 380,
              width: '100%',
            }}
          >
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 900, marginBottom: 6 }}>
              Confirm Purchase
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              Confirm you want to buy this signal
            </p>

            <div style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
            }}>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                {signal.home_team} vs {signal.away_team}
              </p>
              <p style={{ color: '#86efac', fontSize: 12 }}>
                {signal.league} · {kickoff.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {signal.confidence !== null && (
                <p style={{ color: '#86efac', fontSize: 12, marginTop: 4 }}>
                  {signal.confidence}% confidence
                </p>
              )}
            </div>

            <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 20, textAlign: 'center', fontWeight: 700 }}>
              ${signal.price_usd.toFixed(2)} USD will be deducted from your wallet.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={busy}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: 11,
                  padding: 12,
                  fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBuy}
                disabled={busy}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  border: 'none',
                  color: 'black',
                  borderRadius: 11,
                  padding: 12,
                  fontWeight: 900,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {busy ? <><Loader2 size={14} className="animate-spin" /> Buying...</> : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
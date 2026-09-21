// app/components/wallet/AviatorTransferModal.tsx
"use client";

import { useState, type ReactElement } from 'react';
import { X, Loader2, ArrowRight, ArrowLeft, Wallet, Gamepad2, Check } from 'lucide-react';

type Direction = 'to_aviator' | 'to_main';

type Props = {
  open: boolean;
  onClose: () => void;
  mainBalance: number;
  aviatorBalance: number;
  onSuccess: () => void;
};

export default function AviatorTransferModal({
  open,
  onClose,
  mainBalance,
  aviatorBalance,
  onSuccess,
}: Props): ReactElement | null {
  const [direction, setDirection] = useState<Direction>('to_aviator');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const available = direction === 'to_aviator' ? mainBalance : aviatorBalance;

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (num > available) {
      setError(`Insufficient balance. Available: $${available.toFixed(2)}`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/wallet/aviator-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, direction }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Transfer failed');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setAmount('');
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => !busy && onClose()}
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
          maxWidth: 400,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ color: 'white', fontSize: 18, fontWeight: 900, marginBottom: 4 }}>
            Transfer Funds
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            Move money between your Main and Aviator wallets
          </p>
        </div>

        {/* Direction selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}>
          <button
            type="button"
            onClick={() => { setDirection('to_aviator'); setAmount(''); setError(''); }}
            disabled={busy}
            style={{
              background: direction === 'to_aviator' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
              border: direction === 'to_aviator' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 14,
              cursor: busy ? 'not-allowed' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Wallet size={13} color={direction === 'to_aviator' ? '#22c55e' : '#94a3b8'} />
              <ArrowRight size={11} color={direction === 'to_aviator' ? '#22c55e' : '#94a3b8'} />
              <Gamepad2 size={13} color={direction === 'to_aviator' ? '#22c55e' : '#94a3b8'} />
            </div>
            <p style={{
              color: direction === 'to_aviator' ? '#86efac' : 'white',
              fontSize: 12,
              fontWeight: 700,
            }}>
              To Aviator
            </p>
            <p style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
              Main → Aviator
            </p>
          </button>

          <button
            type="button"
            onClick={() => { setDirection('to_main'); setAmount(''); setError(''); }}
            disabled={busy}
            style={{
              background: direction === 'to_main' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
              border: direction === 'to_main' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 14,
              cursor: busy ? 'not-allowed' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Gamepad2 size={13} color={direction === 'to_main' ? '#22c55e' : '#94a3b8'} />
              <ArrowRight size={11} color={direction === 'to_main' ? '#22c55e' : '#94a3b8'} />
              <Wallet size={13} color={direction === 'to_main' ? '#22c55e' : '#94a3b8'} />
            </div>
            <p style={{
              color: direction === 'to_main' ? '#86efac' : 'white',
              fontSize: 12,
              fontWeight: 700,
            }}>
              To Main
            </p>
            <p style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
              Aviator → Main
            </p>
          </button>
        </div>

        {/* Balances */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: 10,
          }}>
            <p style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Main Wallet
            </p>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 900, fontFamily: 'monospace', marginTop: 2 }}>
              ${mainBalance.toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: 10,
            padding: 10,
          }}>
            <p style={{ color: '#86efac', fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Aviator Wallet
            </p>
            <p style={{ color: 'white', fontSize: 15, fontWeight: 900, fontFamily: 'monospace', marginTop: 2 }}>
              ${aviatorBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            color: '#94a3b8',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}>
            Amount (USD)
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#22c55e',
              fontWeight: 900,
              fontSize: 16,
            }}>
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              disabled={busy}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              style={{
                width: '100%',
                background: '#060f1e',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 14px 12px 30px',
                color: 'white',
                fontSize: 18,
                fontWeight: 900,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[10, 25, 50, 100].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(Math.min(v, available)))}
                disabled={busy || v > available}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '6px',
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: busy || v > available ? 'not-allowed' : 'pointer',
                  opacity: v > available ? 0.4 : 1,
                }}
              >
                ${v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(available))}
            disabled={busy || available <= 0}
            style={{
              marginTop: 6,
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#22c55e',
              fontSize: 12,
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            Use max (${available.toFixed(2)})
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
          }}>
            <p style={{ color: '#f87171', fontSize: 12 }}>⚠️ {error}</p>
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Check size={14} color="#22c55e" />
            <p style={{ color: '#86efac', fontSize: 12, fontWeight: 700 }}>
              Transfer complete!
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy || !amount}
          style={{
            width: '100%',
            background: busy || !amount
              ? '#1a2740'
              : 'linear-gradient(135deg,#22c55e,#16a34a)',
            color: busy || !amount ? '#374151' : 'black',
            border: 'none',
            borderRadius: 12,
            padding: 14,
            fontWeight: 900,
            fontSize: 15,
            cursor: busy || !amount ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {busy ? (
            <><Loader2 size={16} className="animate-spin" /> Transferring...</>
          ) : direction === 'to_aviator' ? (
            <>Transfer to Aviator <ArrowRight size={14} /></>
          ) : (
            <><ArrowLeft size={14} /> Transfer to Main</>
          )}
        </button>
      </div>
    </div>
  );
}
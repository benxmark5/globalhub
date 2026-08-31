'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const GROWTH_RATE = 0.17; // must match game_engine_tick() in Postgres exactly

type RoundState = {
  id: string; round_number: number; status: 'betting' | 'running';
  server_seed_hash: string; client_seed: string; nonce: number;
  betting_ends_at: string; running_started_at: string | null;
} | null;

type HistoryItem = {
  round_id: string; round_number: number; crash_point: number;
  server_seed_hash: string; server_seed: string; client_seed: string; nonce: number; crashed_at: string;
};

type MyBet = {
  id: string; amount_usd: number; status: 'active' | 'cashed_out' | 'lost';
  cashout_multiplier: number | null; payout_usd: number | null; auto_cashout_multiplier: number | null;
} | null;

export default function CrashGamePage() {
  const { isAuthenticated } = useAuth();
  const [round, setRound] = useState<RoundState>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [myBet, setMyBet] = useState<MyBet>(null);
  const [betAmount, setBetAmount] = useState('10');
  const [autoCashout, setAutoCashout] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [freezeCrash, setFreezeCrash] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);
  const [cashingOut, setCashingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState<string | null>(null);

  const lastRoundId = useRef<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const freezeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    const res = await fetch('/api/crash-game/state');
    if (!res.ok) return;
    const data = await res.json();

    // Detect a crash we didn't get to see: the round we were tracking
    // is gone, and its result is now sitting at the top of history.
    if (lastRoundId.current && data.round?.id !== lastRoundId.current) {
      const justCrashed = data.history?.find((h: HistoryItem) => h.round_id === lastRoundId.current);
      if (justCrashed) {
        setFreezeCrash(justCrashed.crash_point);
        if (freezeTimeout.current) clearTimeout(freezeTimeout.current);
        freezeTimeout.current = setTimeout(() => setFreezeCrash(null), 2000);
      }
    }

    lastRoundId.current = data.round?.id ?? null;
    setRound(data.round);
    setHistory(data.history || []);
    setMyBet(data.myBet);
  }, []);

  useEffect(() => {
    void poll();
    const interval = setInterval(() => void poll(), 1000);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    if (round?.status === 'running' && round.running_started_at) {
      const startTime = new Date(round.running_started_at).getTime();
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        setMultiplier(Math.exp(GROWTH_RATE * elapsed));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setMultiplier(1.0);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [round?.status, round?.running_started_at]);

  const handlePlaceBet = async () => {
    if (!round || round.status !== 'betting') return;
    setPlacing(true); setError(null);
    const res = await fetch('/api/crash-game/bet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId: round.id, amount: parseFloat(betAmount), autoCashout: autoCashout ? parseFloat(autoCashout) : null }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to place bet');
    else void poll();
    setPlacing(false);
  };

  const handleCashout = async () => {
    if (!myBet || myBet.status !== 'active') return;
    setCashingOut(true); setError(null);
    const res = await fetch('/api/crash-game/cashout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: myBet.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Cash out failed');
    else void poll();
    setCashingOut(false);
  };

  const displayMultiplier = freezeCrash ?? multiplier;
  const gameState = freezeCrash ? 'crashed' : round?.status === 'running' ? 'running' : 'betting';
  const secondsLeft = round?.status === 'betting' ? Math.max(0, Math.ceil((new Date(round.betting_ends_at).getTime() - Date.now()) / 1000)) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gh-text-primary">Crash Game</h1>

      <div className="gh-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gh-accent/5 to-transparent pointer-events-none" />
        <div className="text-center py-12 relative">
          <div className={cn("text-7xl font-bold font-mono transition-colors",
            gameState === 'running' ? 'text-gh-accent-light' : gameState === 'crashed' ? 'text-gh-error' : 'text-gh-text-primary')}>
            {displayMultiplier.toFixed(2)}x
          </div>
          <p className={cn("text-sm mt-2 font-medium",
            gameState === 'betting' && "text-gh-warning",
            gameState === 'running' && "text-gh-success animate-pulse",
            gameState === 'crashed' && "text-gh-error")}>
            {gameState === 'betting' ? `Betting closes in ${secondsLeft}s` : gameState === 'running' ? '● Running' : 'Crashed!'}
          </p>
          {round && (
            <p className="text-[10px] text-gh-text-muted mt-3 font-mono">
              Round #{round.round_number} · hash: {round.server_seed_hash.slice(0, 16)}…
            </p>
          )}
        </div>
      </div>

      {error && <div className="gh-card p-3 text-sm text-gh-error border border-gh-error/30">{error}</div>}

      <div className="gh-card p-6">
        <h3 className="text-sm font-semibold text-gh-text-primary mb-4">
          {myBet?.status === 'active' ? 'Your Bet' : 'Place Bet'}
        </h3>

        {myBet?.status === 'active' ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gh-text-muted">Staked</span>
              <span className="text-gh-text-primary font-semibold">${myBet.amount_usd.toFixed(2)}</span>
            </div>
            {myBet.auto_cashout_multiplier && (
              <div className="flex justify-between text-sm">
                <span className="text-gh-text-muted">Auto cash-out at</span>
                <span className="text-gh-text-primary font-semibold">{myBet.auto_cashout_multiplier.toFixed(2)}x</span>
              </div>
            )}
            <button onClick={handleCashout} disabled={cashingOut || gameState !== 'running'}
              className="gh-btn-primary w-full text-lg py-4 disabled:opacity-50">
              {cashingOut ? 'Cashing out…' : gameState === 'running' ? `Cash Out — $${(myBet.amount_usd * multiplier).toFixed(2)}` : 'Waiting for round to start'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="gh-label">Bet Amount (USD)</label>
                <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} className="gh-input" min="1" step="0.01" />
              </div>
              <div>
                <label className="gh-label">Auto Cashout (optional)</label>
                <input type="number" value={autoCashout} onChange={e => setAutoCashout(e.target.value)} className="gh-input" placeholder="e.g. 2.00" min="1.01" step="0.01" />
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              {[1, 5, 10, 50, 100].map(amt => (
                <button key={amt} onClick={() => setBetAmount(amt.toString())} className="gh-btn-secondary text-xs py-2 px-3">${amt}</button>
              ))}
            </div>
            <button onClick={handlePlaceBet} disabled={placing || gameState !== 'betting' || !isAuthenticated}
              className={cn("gh-btn w-full text-lg py-4", gameState === 'betting' && isAuthenticated ? "gh-btn-primary" : "bg-gh-bg-elevated text-gh-text-muted cursor-not-allowed")}>
              {placing ? 'Placing…' : gameState === 'betting' ? 'Place Bet' : gameState === 'running' ? 'Round in progress' : 'Round ended'}
            </button>
            {!isAuthenticated && <p className="text-xs text-gh-text-muted text-center mt-2">Sign in to place bets</p>}
          </>
        )}

        {myBet?.status === 'lost' && <p className="text-sm text-gh-error text-center mt-3">Last round: lost ${myBet.amount_usd.toFixed(2)}</p>}
        {myBet?.status === 'cashed_out' && <p className="text-sm text-gh-success text-center mt-3">Last round: cashed out at {myBet.cashout_multiplier?.toFixed(2)}x for ${myBet.payout_usd?.toFixed(2)}</p>}
      </div>

      <div className="gh-card p-6">
        <h3 className="text-sm font-semibold text-gh-text-primary mb-4">Round History</h3>
        <div className="flex flex-wrap gap-2">
          {history.map(h => (
            <button key={h.round_id} onClick={() => setShowVerify(showVerify === h.round_id ? null : h.round_id)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-mono font-semibold",
                h.crash_point >= 2 ? "bg-gh-success/10 text-gh-success" : h.crash_point >= 1.5 ? "bg-gh-warning/10 text-gh-warning" : "bg-gh-error/10 text-gh-error")}>
              {h.crash_point.toFixed(2)}x
            </button>
          ))}
        </div>
        {showVerify && history.find(h => h.round_id === showVerify) && (
          <div className="mt-4 p-3 bg-gh-bg-tertiary rounded-xl text-[11px] font-mono text-gh-text-muted space-y-1 break-all">
            {(() => { const h = history.find(x => x.round_id === showVerify)!; return (
              <>
                <p>round #{h.round_number} · nonce {h.nonce}</p>
                <p>server seed: {h.server_seed}</p>
                <p>hash: {h.server_seed_hash}</p>
                <p className="text-gh-text-muted/70">SHA-256(server seed) should equal the hash above — that's the whole proof.</p>
              </>
            ); })()}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchCurrentCrashRound, fetchCrashHistory, placeCrashBet } from '@/lib/api/services';
import type { CrashGameRound, CrashGameBet } from '@/types';
import { cn } from '@/lib/utils';

export default function CrashGamePage() {
  const { isAuthenticated } = useAuth();
  const [currentRound, setCurrentRound] = useState<CrashGameRound | null>(null);
  const [history, setHistory] = useState<CrashGameRound[]>([]);
  const [betAmount, setBetAmount] = useState('10');
  const [autoCashout, setAutoCashout] = useState('');
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [myBets, setMyBets] = useState<CrashGameBet[]>([]);
  const animationRef = useRef<number | null>(null);

  const loadData = async () => {
    const [{ data: round }, { data: hist }] = await Promise.all([
      fetchCurrentCrashRound(), fetchCrashHistory(15)
    ]);
    setCurrentRound(round); setHistory(hist || []);
    if (round) {
      if (round.status === 'waiting') setGameState('waiting');
      else if (round.status === 'crashed') setGameState('crashed');
      else setGameState('running');
    }
  };

  useEffect(() => {
    void loadData();
    const interval = setInterval(() => { void loadData(); }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameState === 'running') {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const m = Math.pow(Math.E, 0.06 * elapsed);
        setMultiplier(parseFloat(m.toFixed(2)));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (gameState === 'waiting') setMultiplier(1.0);
      if (gameState === 'crashed' && currentRound) setMultiplier(currentRound.crash_point);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState, currentRound]);

  const handlePlaceBet = async () => {
    if (!currentRound || !isAuthenticated) return;
    const { data, error } = await placeCrashBet(currentRound.id, parseFloat(betAmount), autoCashout ? parseFloat(autoCashout) : undefined);
    if (error) alert('Failed to place bet');
    else if (data) setMyBets(prev => [data, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gh-text-primary">Crash Game</h1>
      <div className="gh-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-gh-accent/5 to-transparent pointer-events-none" />
        <div className="text-center py-12 relative">
          <div className={cn("text-7xl font-bold font-mono transition-colors",
            gameState === 'running' ? 'text-gh-accent-light' : gameState === 'crashed' ? 'text-gh-error' : 'text-gh-text-primary')}>
            {multiplier.toFixed(2)}x
          </div>
          <p className={cn("text-sm mt-2 font-medium",
            gameState === 'waiting' && "text-gh-warning",
            gameState === 'running' && "text-gh-success animate-pulse",
            gameState === 'crashed' && "text-gh-error")}>
            {gameState === 'waiting' ? 'Next round in...' : gameState === 'running' ? '● Running' : 'Crashed!'}
          </p>
        </div>
        <div className="h-32 bg-gh-bg-tertiary rounded-xl border border-gh-border mb-4 relative overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none">
            {gameState === 'running' && (
              <path d={`M 0 128 Q ${multiplier * 20} ${128 - multiplier * 10} ${multiplier * 40} ${128 - multiplier * 20}`}
                fill="none" stroke="#6366f1" strokeWidth="2" />
            )}
          </svg>
        </div>
      </div>

      <div className="gh-card p-6">
        <h3 className="text-sm font-semibold text-gh-text-primary mb-4">Place Bet</h3>
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
        <button onClick={handlePlaceBet} disabled={gameState !== 'waiting' || !isAuthenticated}
          className={cn("gh-btn w-full text-lg py-4", gameState === 'waiting' && isAuthenticated ? "gh-btn-primary" : "bg-gh-bg-elevated text-gh-text-muted cursor-not-allowed")}>
          {gameState === 'waiting' ? 'Place Bet' : gameState === 'running' ? 'Round in progress' : 'Round ended'}
        </button>
        {!isAuthenticated && <p className="text-xs text-gh-text-muted text-center mt-2">Sign in to place bets</p>}
      </div>

      <div className="gh-card p-6">
        <h3 className="text-sm font-semibold text-gh-text-primary mb-4">Round History</h3>
        <div className="flex flex-wrap gap-2">
          {history.map(round => (
            <span key={round.id} className={cn("px-3 py-1.5 rounded-lg text-sm font-mono font-semibold",
              round.crash_point >= 2 ? "bg-gh-success/10 text-gh-success" : round.crash_point >= 1.5 ? "bg-gh-warning/10 text-gh-warning" : "bg-gh-error/10 text-gh-error")}>
              {round.crash_point.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
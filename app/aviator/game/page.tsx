// app/aviator/game/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Loader2, AlertCircle, User, LogIn, UserPlus, Volume2, VolumeX,
  Rocket, Users, Award, RefreshCw, Wallet,
} from 'lucide-react';
import AviatorTransferModal from '@/app/components/wallet/AviatorTransferModal';

const GROWTH_RATE = 0.17;
const MIN_BET = 1;
const MAX_BET = 10000;
const FLIGHT_MAX_MULTIPLIER = 5;
const DEMO_START_BALANCE = 10000;
const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

type RoundState = {
  id: string;
  round_number: number;
  status: 'betting' | 'running';
  server_seed_hash: string;
  betting_ends_at: string;
  running_started_at: string | null;
} | null;

type HistoryItem = {
  id?: string;
  round_id?: string;
  round_number: number;
  crash_point: number;
};

type PublicBet = { anonymous_id: string; amount: number; status: string; cashout_at: number | null };

type RealBet = {
  id: string;
  amount_usd: number;
  status: 'active' | 'cashed_out' | 'lost';
  cashout_multiplier: number | null;
  payout_usd: number | null;
  auto_cashout_multiplier: number | null;
} | null;

type DemoBet = {
  amount: number;
  autoCashout: number | null;
  status: 'active' | 'cashed_out' | 'lost';
  cashoutMultiplier: number | null;
  payout: number | null;
} | null;

function getPlanePosition(progress: number, startX: number, startY: number, endX: number, endY: number) {
  // Clamp progress: 0 = bottom-left, 1 = top-right
  const t = Math.min(Math.max(progress, 0), 1);

  // Exponential ease: rises slowly at first, then faster, then flattens
  const ease = Math.pow(t, 1.6);

  // Horizontal: linear left→right
  const x = startX + (endX - startX) * t;

  // Vertical: exponential ease from bottom to top
  const y = startY - (startY - endY) * ease;

  // Tangent for plane rotation
  const dx = (endX - startX);
  const dy = -(startY - endY) * (1.6 * Math.pow(Math.max(t, 0.001), 0.6));
  const angle = Math.atan2(dy, dx);

  return { x, y, angle };
}

type Particle = { t: number; offset: number; life: number };

export default function AviatorGamePage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && !!user;

  const [accountMode, setAccountMode] = useState<'demo' | 'real'>('demo');
  const [demoBalance, setDemoBalance] = useState(DEMO_START_BALANCE);
  const [demoBets, setDemoBets] = useState<Record<1 | 2, DemoBet>>({ 1: null, 2: null });

  const [connected, setConnected] = useState(false);
  const [round, setRound] = useState<RoundState>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [publicBets, setPublicBets] = useState<PublicBet[]>([]);
  const [realBets, setRealBets] = useState<Record<1 | 2, RealBet>>({ 1: null, 2: null });
  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [aviatorBalance, setAviatorBalance] = useState(0);

  const [betAmount, setBetAmount] = useState<Record<1 | 2, string>>({ 1: '10', 2: '25' });
  const [autoCashout, setAutoCashout] = useState<Record<1 | 2, string>>({ 1: '', 2: '' });
  const [busy, setBusy] = useState<Record<1 | 2, boolean>>({ 1: false, 2: false });

  const [multiplier, setMultiplier] = useState(1.0);

  // ── Persist demo state across sessions ──
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const db = localStorage.getItem('gh_aviator_demo_balance');
      if (db !== null) setDemoBalance(Number(db) || DEMO_START_BALANCE);

      const ba = localStorage.getItem('gh_aviator_bet_amounts');
      if (ba) {
        const parsed = JSON.parse(ba);
        if (parsed?.[1] !== undefined && parsed?.[2] !== undefined) setBetAmount(parsed);
      }

      const ac = localStorage.getItem('gh_aviator_auto_cashouts');
      if (ac) {
        const parsed = JSON.parse(ac);
        if (parsed?.[1] !== undefined && parsed?.[2] !== undefined) setAutoCashout(parsed);
      }

      const am = localStorage.getItem('gh_aviator_account_mode');
      if (am === 'demo' || am === 'real') setAccountMode(am);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Save demo balance when it changes
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('gh_aviator_demo_balance', String(demoBalance)); } catch { /* ignore */ }
  }, [demoBalance, hydrated]);

  // Save bet amounts when they change
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('gh_aviator_bet_amounts', JSON.stringify(betAmount)); } catch { /* ignore */ }
  }, [betAmount, hydrated]);

  // Save auto-cashout values when they change
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('gh_aviator_auto_cashouts', JSON.stringify(autoCashout)); } catch { /* ignore */ }
  }, [autoCashout, hydrated]);

  // Save account mode when it changes
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('gh_aviator_account_mode', accountMode); } catch { /* ignore */ }
  }, [accountMode, hydrated]);
  const [freezeCrash, setFreezeCrash] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [bettingProgress, setBettingProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastRoundId = useRef<string | null>(null);
  const lastStatus = useRef<string | null>(null);
  const freezeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const demoAutoFiredRef = useRef<Record<1 | 2, boolean>>({ 1: false, 2: false });
  const realAutoFiredRef = useRef<Record<1 | 2, boolean>>({ 1: false, 2: false });
const settleStartRef = useRef<number | null>(null);

  const activeBalance = accountMode === 'demo' ? demoBalance : aviatorBalance;
  const bets = accountMode === 'demo' ? demoBets : realBets;

  const playSound = useCallback((type: 'takeoff' | 'crash' | 'cashout') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.value = 0.07;
      if (type === 'takeoff') {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(); osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
      }
    } catch { /* ignore */ }
  }, [soundEnabled]);

  const poll = useCallback(async () => {
    if (pollAbortRef.current) pollAbortRef.current.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;
    try {
      const res = await fetch('/api/crash-game/state', { signal: controller.signal });
      if (!res.ok) return;
      const data = await res.json();

      if (lastRoundId.current && data.round?.id !== lastRoundId.current) {
        const justCrashed = data.history?.find((h: HistoryItem) => h.round_id === lastRoundId.current);
        if (justCrashed) {
          setFreezeCrash(justCrashed.crash_point);
          playSound('crash');
          if (freezeTimeout.current) clearTimeout(freezeTimeout.current);
          freezeTimeout.current = setTimeout(() => setFreezeCrash(null), 2200);

          setDemoBets(prev => {
            const next = { ...prev };
            ([1, 2] as const).forEach(slot => {
              if (next[slot]?.status === 'active') {
                next[slot] = { ...next[slot]!, status: 'lost', payout: 0 };
              }
            });
            return next;
          });
          demoAutoFiredRef.current = { 1: false, 2: false };
          realAutoFiredRef.current = { 1: false, 2: false };
        }
      }
      if (data.round?.status === 'running' && lastStatus.current !== 'running') playSound('takeoff');
      lastStatus.current = data.round?.status ?? null;
      lastRoundId.current = data.round?.id ?? null;

      setRound(data.round);
      setHistory(data.history || []);
      setPublicBets(data.publicBets || []);
      setRealBets(data.myBets || { 1: null, 2: null });
      setRealBalance(data.balance);
      setAviatorBalance(Number(data.aviatorBalance ?? 0));
      setConnected(true);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setConnected(false);
    }
  }, [playSound]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => {
      await poll();
      if (!stopped) timer = setTimeout(loop, 1000);
    };
    loop();
    return () => {
      stopped = true;
      clearTimeout(timer);
      if (pollAbortRef.current) pollAbortRef.current.abort();
    };
  }, [poll]);

  // Betting progress ticker (drives the bottom bar)
  useEffect(() => {
    if (round?.status !== 'betting') {
      setBettingProgress(0);
      return;
    }
        const endsAt = new Date(round.betting_ends_at).getTime();
    const startAt = endsAt - 30000; // betting window = 30s (matches game_settings)
    const id = setInterval(() => {
      const now = Date.now();
      const p = Math.max(0, Math.min(1, 1 - (endsAt - now) / (endsAt - startAt)));
      setBettingProgress(p);
    }, 100);
    return () => clearInterval(id);
  }, [round?.status, round?.betting_ends_at]);

  useEffect(() => {
    if (round?.status === 'running' && round.running_started_at) {
      const startTime = new Date(round.running_started_at).getTime();
      const animate = () => {
        const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
        const raw = Math.exp(GROWTH_RATE * elapsed);
        const m = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 1_000_000) : 1.0;
        setMultiplier(m);

        ([1, 2] as const).forEach(slot => {
          const bet = demoBets[slot];
          if (bet?.status === 'active' && bet.autoCashout && !demoAutoFiredRef.current[slot] && m >= bet.autoCashout) {
            demoAutoFiredRef.current[slot] = true;
            const payout = Math.round(bet.amount * bet.autoCashout * 100) / 100;
            setDemoBalance(b => b + payout);
            setDemoBets(prev => ({ ...prev, [slot]: { ...bet, status: 'cashed_out', cashoutMultiplier: bet.autoCashout, payout } }));
            playSound('cashout');
          }
        });
                ([1, 2] as const).forEach(slot => {
          const bet = realBets[slot];
          if (
            bet?.status === 'active' &&
            bet.auto_cashout_multiplier &&
            !realAutoFiredRef.current[slot] &&
            m >= bet.auto_cashout_multiplier
          ) {
            realAutoFiredRef.current[slot] = true;
            fetch('/api/crash-game/cashout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ betId: bet.id }),
            })
              .then(() => { playSound('cashout'); void poll(); })
              .catch(() => {});
          }
        });

        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setMultiplier(1.0);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [round?.status, round?.running_started_at, demoBets, playSound]);

  const displayMultiplier = freezeCrash ?? multiplier;
  const gameState: 'betting' | 'running' | 'crashed' = freezeCrash ? 'crashed' : round?.status === 'running' ? 'running' : 'betting';
  const isFlying = gameState === 'running';

  const placeBet = async (slot: 1 | 2) => {
    const amount = parseFloat(betAmount[slot]);
    if (!round || round.status !== 'betting') { setError('Round is not accepting bets'); return; }
    if (!amount || amount < MIN_BET) { setError(`Minimum bet is $${MIN_BET}`); return; }
    if (activeBalance !== null && amount > activeBalance) { setError('Insufficient balance'); return; }

    if (accountMode === 'demo') {
      setDemoBalance(b => b - amount);
      setDemoBets(prev => ({
        ...prev,
        [slot]: {
          amount,
          autoCashout: autoCashout[slot] ? parseFloat(autoCashout[slot]) : null,
          status: 'active',
          cashoutMultiplier: null,
          payout: null,
        },
      }));
      demoAutoFiredRef.current[slot] = false;
      return;
    }

    if (!isAuthenticated) { setShowAuthPrompt(true); return; }
    setBusy(b => ({ ...b, [slot]: true }));
    setError('');
    const res = await fetch('/api/crash-game/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roundId: round.id,
        amount,
        autoCashout: autoCashout[slot] ? parseFloat(autoCashout[slot]) : null,
        slot,
      }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to place bet');
    else void poll();
    setBusy(b => ({ ...b, [slot]: false }));
  };

  const cashout = async (slot: 1 | 2) => {
    if (accountMode === 'demo') {
      const bet = demoBets[slot];
      if (!bet || bet.status !== 'active' || !isFlying) return;
      const payout = Math.round(bet.amount * multiplier * 100) / 100;
      setDemoBalance(b => b + payout);
      setDemoBets(prev => ({ ...prev, [slot]: { ...bet, status: 'cashed_out', cashoutMultiplier: multiplier, payout } }));
      playSound('cashout');
      return;
    }
    const bet = realBets[slot];
    if (!bet || bet.status !== 'active') return;
    setBusy(b => ({ ...b, [slot]: true }));
    setError('');
    const res = await fetch('/api/crash-game/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: bet.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to cash out');
    else void poll();
    setBusy(b => ({ ...b, [slot]: false }));
  };
  const cancelBet = async (slot: 1 | 2) => {
    if (accountMode === 'demo') {
      const bet = demoBets[slot];
      if (!bet || bet.status !== 'active') return;
      setDemoBalance(b => b + bet.amount);
      setDemoBets(prev => ({ ...prev, [slot]: null }));
      demoAutoFiredRef.current[slot] = false;
      return;
    }

    const bet = realBets[slot];
    if (!bet || bet.status !== 'active') return;
    setBusy(b => ({ ...b, [slot]: true }));
    setError('');
    const res = await fetch('/api/crash-game/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: bet.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to cancel bet');
    else {
      realAutoFiredRef.current[slot] = false;
      void poll();
    }
    setBusy(b => ({ ...b, [slot]: false }));
  };
   const resetDemo = () => {
    setDemoBalance(DEMO_START_BALANCE);
    setDemoBets({ 1: null, 2: null });
    try { localStorage.removeItem('gh_aviator_demo_balance'); } catch { /* ignore */ }
  };

  // ============================================================
  // CANVAS DRAWING
  // ============================================================
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 460;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.clearRect(0, 0, width, height);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#0A0E15');
    bg.addColorStop(0.5, '#0E1420');
    bg.addColorStop(1, '#0A0E15');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Flight path
    const startX = width * 0.06, startY = height * 0.82;
    const endX = width * 0.9, endY = height * 0.15;

    // progress goes 0→1 in the 1x→5x range; clamps at 1 afterward
    const rawProgress = (displayMultiplier - 1) / (FLIGHT_MAX_MULTIPLIER - 1);
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    const plane = getPlanePosition(progress, startX, startY, endX, endY);
    const stateColor = gameState === 'crashed' ? '#ef4444' : gameState === 'running' ? '#22c55e' : '#8b5cf6';

    // Draw the trail
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * progress;
      const ease = Math.pow(t, 1.6);
      const ptX = startX + (endX - startX) * t;
      const ptY = startY - (startY - endY) * ease;
      ctx.lineTo(ptX, ptY);
    }
    ctx.shadowColor = stateColor;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = stateColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill under the trail
    ctx.lineTo(plane.x, height);
    ctx.lineTo(startX, height);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, endY, 0, startY);
    fillGrad.addColorStop(0, stateColor + '30');
    fillGrad.addColorStop(1, stateColor + '00');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Smoke particles trailing behind the plane
    if (isFlying && progress < 1 && Math.random() < 0.6) {
      particlesRef.current.push({
        t: Math.max(0, progress - 0.01),
        offset: (Math.random() - 0.5) * 6,
        life: 1,
      });
    }
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    for (const p of particlesRef.current) {
      const ease = Math.pow(p.t, 1.6);
      const ptX = startX + (endX - startX) * p.t;
      const ptY = startY - (startY - endY) * ease;
      const size = (1 - p.life) * 10 + 3;
      ctx.beginPath();
      ctx.arc(ptX - (1 - p.life) * 14, ptY + p.offset + (1 - p.life) * 6, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,210,${p.life * 0.25})`;
      ctx.fill();
      p.life -= 0.02;
    }

    // Plane bobbing (sinusoidal up-down wobble)
    const bobTime = Date.now() * 0.004;
    const bobStrength = isFlying ? 1 : 0;
    const bobY = Math.sin(bobTime) * 3 * bobStrength;

    // Draw the plane
        let settleOffset = 0;
    if (gameState === 'crashed') {
      if (settleStartRef.current === null) settleStartRef.current = Date.now();
      const t = Math.min(1, (Date.now() - settleStartRef.current) / 1400);
      const eased = 1 - Math.pow(1 - t, 2);
      settleOffset = eased * (height * 0.55);
    } else {
      settleStartRef.current = null;
    }

    ctx.save();
    ctx.translate(plane.x, plane.y + bobY + settleOffset);
    ctx.rotate(plane.angle);
    ctx.scale(2.2, 2.2);

    if (isFlying) {
      const g = ctx.createRadialGradient(-16, 0, 0, -16, 0, 12);
      g.addColorStop(0, 'rgba(255,100,0,0.8)');
      g.addColorStop(0.5, 'rgba(255,200,0,0.4)');
      g.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(-16, 0, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-10, 0); ctx.lineTo(-17, -8); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -2); ctx.lineTo(-15, -9); ctx.lineTo(-13, -9); ctx.lineTo(-8, -1); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, 2); ctx.lineTo(-15, 9); ctx.lineTo(-13, 9); ctx.lineTo(-8, 1); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(4, -2); ctx.lineTo(-6, -18); ctx.lineTo(-12, -18); ctx.lineTo(-2, -2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, 2); ctx.lineTo(-6, 18); ctx.lineTo(-12, 18); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill();

    const bodyGrad = ctx.createLinearGradient(0, -4, 0, 4);
    bodyGrad.addColorStop(0, '#fca5a5');
    bodyGrad.addColorStop(0.5, '#ef4444');
    bodyGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.quadraticCurveTo(12, -3.5, 4, -3.5);
    ctx.lineTo(-14, -2.5);
    ctx.quadraticCurveTo(-17, 0, -14, 2.5);
    ctx.lineTo(4, 3.5);
    ctx.quadraticCurveTo(12, 3.5, 18, 0);
    ctx.closePath();
    ctx.fill();

    const canopyGrad = ctx.createLinearGradient(6, -2, 10, 2);
    canopyGrad.addColorStop(0, '#38bdf8');
    canopyGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.ellipse(8, -0.5, 4.5, 2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-11, -17, 1, 1);
    ctx.fillRect(-11, 16, 1, 1);
    ctx.restore();

    // Center multiplier text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.min(width / 4.2, 76);
    ctx.font = `900 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = gameState === 'crashed' ? '#f87171' : '#ffffff';
    ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height * 0.38);

    // Status text
    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = gameState === 'running' ? '#4ade80' : gameState === 'crashed' ? '#f87171' : '#fbbf24';
    ctx.fillText(
      gameState === 'running' ? '● FLYING' : gameState === 'crashed' ? 'CRASHED' : 'BETTING',
      width / 2, height * 0.55
    );

    // Round number
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText(`ROUND #${round?.round_number ?? '--'}`, width / 2, height * 0.94);

    // ============================================================
    // Betting timer bar (bottom, right→left sweep)
    // ============================================================
    if (gameState === 'betting') {
      const barY = height - 6;
      const barHeight = 4;
      const barWidth = width;

      // Background track
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, barY, barWidth, barHeight);

      // Filled portion sweeps from right to left
      const filledWidth = barWidth * (1 - bettingProgress);
      const barGrad = ctx.createLinearGradient(0, 0, barWidth, 0);
      barGrad.addColorStop(0, '#fbbf24');
      barGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = barGrad;
      ctx.fillRect(barWidth - filledWidth, barY, filledWidth, barHeight);
    }
  }, [displayMultiplier, gameState, isFlying, round, secondsLeftSafe(round), bettingProgress]);

  // Helper to keep secondsLeft out of the deps issue
  function secondsLeftSafe(r: RoundState) {
    if (r?.status !== 'betting') return 0;
    const endsAt = new Date(r.betting_ends_at).getTime();
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }

  useEffect(() => {
    let raf: number;
    const loop = () => { drawGame(); raf = requestAnimationFrame(loop); };
    loop();
    const resize = () => drawGame();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [drawGame]);

  if (!connected) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-white/40">Connecting to Aviator...</span>
      </div>
    );
  }

        // ── Render a bet slot ──
  const renderSlot = (slot: 1 | 2) => {
    const bet = bets[slot];
    const realBet = accountMode === 'real' ? realBets[slot] : null;
    const isBetting = round?.status === 'betting';
    const isActive = bet?.status === 'active';
    const isSettled = bet?.status === 'cashed_out' || bet?.status === 'lost';
    const betDisabled = isActive;

    // Won/lost amount for the compact chip
    const wonAmount = accountMode === 'demo'
      ? (demoBets[slot]?.payout ?? 0)
      : (realBets[slot]?.payout_usd ?? 0);

    // Armed auto-cashout value (for the AUTO badge overlay)
    const armedAuto = realBet?.auto_cashout_multiplier ?? (demoBets[slot]?.autoCashout ?? null);

    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Bet {slot}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>Min ${MIN_BET}</span>
        </div>

        {/* Amount row: − | input | + | [won/lost chip] | [action button] */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 34px auto auto', gap: 6, alignItems: 'stretch' }}>
          <button
            type="button"
            onClick={() => setBetAmount(a => ({ ...a, [slot]: String(Math.max(MIN_BET, (Number(betAmount[slot]) || 0) - 10)) }))}
            disabled={betDisabled}
            style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 10, color: 'var(--text)', fontSize: 18, fontWeight: 900, cursor: betDisabled ? 'not-allowed' : 'pointer', opacity: betDisabled ? 0.4 : 1 }}
          >−</button>

          <input
            type="number"
            value={betAmount[slot]}
            onChange={e => setBetAmount(a => ({ ...a, [slot]: e.target.value }))}
            onBlur={() => {
              const n = Number(betAmount[slot]);
              const cap = Math.min(MAX_BET, activeBalance ?? MAX_BET);
              const clamped = !Number.isFinite(n) || n <= 0
                ? MIN_BET
                : Math.max(MIN_BET, Math.min(cap, n));
              setBetAmount(a => ({ ...a, [slot]: String(clamped) }));
            }}
            disabled={betDisabled}
            className="form-input"
            style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', textAlign: 'center', padding: '10px 6px' }}
          />

          <button
            type="button"
            onClick={() => setBetAmount(a => ({ ...a, [slot]: String(Math.min(MAX_BET, (Number(betAmount[slot]) || 0) + 10)) }))}
            disabled={betDisabled}
            style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 10, color: 'var(--text)', fontSize: 18, fontWeight: 900, cursor: betDisabled ? 'not-allowed' : 'pointer', opacity: betDisabled ? 0.4 : 1 }}
          >+</button>

          {/* Compact Won/Lost chip — only when settled */}
          {isSettled && (
            <div style={{
              padding: '8px 10px',
              background: bet!.status === 'cashed_out' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${bet!.status === 'cashed_out' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)'}`,
              color: bet!.status === 'cashed_out' ? '#4ade80' : '#f87171',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
            }}>
              {bet!.status === 'cashed_out' ? `Won $${wonAmount.toFixed(2)}` : 'Lost'}
            </div>
          )}

          {/* Action button — always visible when betting is open */}
          {isActive ? (
            isFlying ? (
              <button
                type="button"
                onClick={() => cashout(slot)}
                disabled={busy[slot]}
                style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'black', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: busy[slot] ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {busy[slot] ? '...' : 'CASH $' + (accountMode === 'demo' ? (bet as DemoBet)!.amount * multiplier : (realBet as RealBet)!.amount_usd * multiplier).toFixed(2)}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => cancelBet(slot)}
                disabled={busy[slot]}
                style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: busy[slot] ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {busy[slot] ? '...' : 'CANCEL'}
              </button>
            )
          ) : isBetting ? (
            <button
              type="button"
              onClick={() => placeBet(slot)}
              disabled={busy[slot]}
              style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'black', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 14, cursor: busy[slot] ? 'not-allowed' : 'pointer', opacity: busy[slot] ? 0.5 : 1, whiteSpace: 'nowrap' }}
            >
              {busy[slot] ? '...' : 'BET'}
            </button>
          ) : (
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: 10, textAlign: 'center', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Waiting…
            </div>
          )}
        </div>

        {/* Quick amount chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[10, 50, 100].map(delta => (
            <button
              key={delta}
              type="button"
              onClick={() => setBetAmount(a => ({ ...a, [slot]: String(Math.min(MAX_BET, (Number(a[slot]) || 0) + delta)) }))}
              disabled={betDisabled}
              style={{ padding: '6px 0', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: betDisabled ? 'not-allowed' : 'pointer', opacity: betDisabled ? 0.4 : 1 }}
            >
              +{delta}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBetAmount(a => ({ ...a, [slot]: String(Math.min(MAX_BET, activeBalance ?? MAX_BET)) }))}
            disabled={betDisabled}
            style={{ padding: '6px 0', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, cursor: betDisabled ? 'not-allowed' : 'pointer', opacity: betDisabled ? 0.4 : 1 }}
          >
            MAX
          </button>
        </div>

        {/* Auto cash-out input with AUTO badge */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Auto cash-out (e.g. 2.00)"
            value={autoCashout[slot]}
            onChange={e => setAutoCashout(a => ({ ...a, [slot]: e.target.value }))}
            disabled={betDisabled}
            className="form-input"
            style={{
              fontSize: 12,
              padding: '8px 10px',
              paddingRight: armedAuto ? 76 : 10,
            }}
          />
          {armedAuto != null && isActive && (
            <span style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(34,197,94,0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              pointerEvents: 'none',
            }}>
              AUTO {Number(armedAuto).toFixed(2)}x
            </span>
          )}
        </div>
      </div>
    );
  };
  
         
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border-strong)',
        background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 20,
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Rocket className="w-5 h-5 text-red-500" />
            <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>Aviator</span>
          </Link>

          {/* Demo / Real toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg)', borderRadius: 10,
            border: '1px solid var(--border-strong)', overflow: 'hidden',
          }}>
            {(['demo', 'real'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  if (mode === 'real' && !isAuthenticated) { setShowAuthPrompt(true); return; }
                  setAccountMode(mode);
                }}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: 12, textTransform: 'uppercase',
                  background: accountMode === mode
                    ? (mode === 'demo' ? '#8b5cf6' : '#22c55e')
                    : 'transparent',
                  color: accountMode === mode ? 'black' : 'var(--text-muted)',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Balance */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg)', border: '1px solid var(--border-strong)',
            borderRadius: 10, padding: '6px 12px',
          }}>
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>
              ${(activeBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {accountMode === 'demo' && (
            <button
              type="button"
              onClick={resetDemo}
              title="Reset demo balance"
              style={{
                background: 'var(--bg)', border: '1px solid var(--border-strong)',
                borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {accountMode === 'real' && (
            <button
              type="button"
              onClick={() => setShowTransfer(true)}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border-strong)',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                color: 'var(--text)', fontWeight: 700, fontSize: 12,
              }}
            >
              Transfer
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled(s => !s)}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border-strong)',
              borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div
        className="aviator-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 12,
          padding: 12,
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* ── Left column: canvas + bet slots ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Canvas */}
          <div
            className="aviator-canvas-wrap"
            style={{
              position: 'relative',
              width: '100%',
              height: 460,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid var(--border-strong)',
              background: '#0A0E15',
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>

          {/* Bet slots */}
          <div className="aviator-slots" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {renderSlot(1)}
            {renderSlot(2)}
          </div>
        </div>

        {/* ── Right column: history + live bets ── */}
        <div className="aviator-side" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* History */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 16, padding: 12,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
              color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            }}>
              <Award className="w-4 h-4" /> Recent Rounds
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.slice(0, 30).map(h => (
  <span
    key={h.id ?? h.round_number}
                  style={{
                    padding: '4px 9px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                    fontFamily: 'monospace',
                    background: h.crash_point >= 2 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                    color: h.crash_point >= 2 ? '#4ade80' : '#f87171',
                    border: `1px solid ${h.crash_point >= 2 ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
                  }}
                >
                  {h.crash_point.toFixed(2)}x
                </span>
              ))}
              {history.length === 0 && (
                <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>No rounds yet</span>
              )}
            </div>
          </div>

          {/* Live bets */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 16, padding: 12, flex: 1, minHeight: 260,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              }}>
                <Users className="w-4 h-4" /> Live Bets
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700 }}>
                {publicBets.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {publicBets.slice(0, 30).map((b, i) => (
                <div
                  key={`${b.anonymous_id}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 8,
                    background: b.status === 'cashed_out' ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${b.status === 'cashed_out' ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                  }}
                >
                  <span style={{
                    color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90,
                  }}>
                    {b.anonymous_id}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text)', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
                      ${b.amount.toFixed(2)}
                    </span>
                    {b.status === 'cashed_out' && b.cashout_at && (
                      <span style={{
                        color: '#4ade80', fontSize: 11, fontWeight: 800, fontFamily: 'monospace',
                      }}>
                        {b.cashout_at.toFixed(2)}x
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {publicBets.length === 0 && (
                <span style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', padding: 16 }}>
                  No bets this round
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Error toast ── */}
      {error && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
          color: '#fca5a5', borderRadius: 12, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 60,
          fontSize: 13, fontWeight: 700,
        }}>
          <AlertCircle className="w-4 h-4" />
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', marginLeft: 4, fontWeight: 900 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Auth prompt ── */}
      {showAuthPrompt && (
        <div
          onClick={() => setShowAuthPrompt(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              borderRadius: 20, padding: 28, maxWidth: 380, width: '90%',
              display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <User className="w-10 h-10 text-emerald-400" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>
              Sign in to play for real
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Create an account or log in to place real-money bets on Aviator.
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <Link
                href="/login"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', background: 'var(--bg)', border: '1px solid var(--border-strong)',
                  borderRadius: 10, color: 'var(--text)', fontWeight: 800, fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <LogIn className="w-4 h-4" /> Log in
              </Link>
              <Link
                href="/register"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 0', background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  borderRadius: 10, color: 'black', fontWeight: 900, fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <UserPlus className="w-4 h-4" /> Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Transfer modal ── */}
      {showTransfer && (
        <AviatorTransferModal
          open={showTransfer}
          onClose={() => setShowTransfer(false)}
          mainBalance={realBalance ?? 0}
          aviatorBalance={aviatorBalance}
          onSuccess={() => { void poll(); }}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .aviator-layout {
            grid-template-columns: 1fr !important;
          }
          .aviator-side {
            order: 3;
          }
          .aviator-canvas-wrap {
            height: 300px !important;
          }
          .aviator-slots {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Loader2, AlertCircle, User, LogIn, UserPlus, Volume2, VolumeX,
  Rocket, Radio, Users, Award, ShieldCheck, RotateCcw
} from 'lucide-react';

const GROWTH_RATE = 0.17; 
const MIN_BET = 1;
const MAX_BET = 10000;
const FLIGHT_MAX_MULTIPLIER = 100; 
const DEMO_START_BALANCE = 10000;
const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

type RoundState = {
  id: string; round_number: number; status: 'betting' | 'running';
  server_seed_hash: string; betting_ends_at: string; running_started_at: string | null;
} | null;

type HistoryItem = { round_id: string; round_number: number; crash_point: number; server_seed: string; server_seed_hash: string; nonce: number };
type PublicBet = { anonymous_id: string; amount: number; status: string; cashout_at: number | null };
type RealBet = { id: string; amount_usd: number; status: 'active' | 'cashed_out' | 'lost'; cashout_multiplier: number | null; payout_usd: number | null; auto_cashout_multiplier: number | null } | null;
type DemoBet = { amount: number; autoCashout: number | null; status: 'active' | 'cashed_out' | 'lost'; cashoutMultiplier: number | null; payout: number | null } | null;

function getPlanePosition(progress: number, startX: number, startY: number, endX: number, endY: number) {
  const cpX = startX + (endX - startX) * 0.5;
  const cpY = startY - (startY - endY) * 0.15;
  const t = Math.min(Math.max(progress, 0), 1);
  const omt = 1 - t;
  const x = omt * omt * startX + 2 * omt * t * cpX + t * t * endX;
  const y = omt * omt * startY + 2 * omt * t * cpY + t * t * endY;
  const dx = 2 * omt * (cpX - startX) + 2 * t * (endX - cpX);
  const dy = 2 * omt * (cpY - startY) + 2 * t * (endY - cpY);
  return { x, y, angle: Math.atan2(dy, dx), cpX, cpY };
}
function getCurvePoint(t: number, startX: number, startY: number, cpX: number, cpY: number, endX: number, endY: number) {
  const omt = 1 - t;
  return { x: omt * omt * startX + 2 * omt * t * cpX + t * t * endX, y: omt * omt * startY + 2 * omt * t * cpY + t * t * endY };
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

  const [betAmount, setBetAmount] = useState<Record<1 | 2, string>>({ 1: '10', 2: '25' });
  const [autoCashout, setAutoCashout] = useState<Record<1 | 2, string>>({ 1: '', 2: '' });
  const [busy, setBusy] = useState<Record<1 | 2, boolean>>({ 1: false, 2: false });

  const [multiplier, setMultiplier] = useState(1.0);
  const [freezeCrash, setFreezeCrash] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showVerify, setShowVerify] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastRoundId = useRef<string | null>(null);
  const lastStatus = useRef<string | null>(null);
  const freezeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const demoAutoFiredRef = useRef<Record<1 | 2, boolean>>({ 1: false, 2: false });

  const activeBalance = accountMode === 'demo' ? demoBalance : realBalance;
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
            (['1', '2'] as const).forEach(k => {
              const slot = Number(k) as 1 | 2;
              if (next[slot]?.status === 'active') {
                next[slot] = { ...next[slot]!, status: 'lost', payout: 0 };
              }
            });
            return next;
          });
          demoAutoFiredRef.current = { 1: false, 2: false };
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
      setConnected(true);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setConnected(false);
    }
  }, [playSound]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const loop = async () => { await poll(); if (!stopped) timer = setTimeout(loop, 1000); };
    loop();
    return () => { stopped = true; clearTimeout(timer); if (pollAbortRef.current) pollAbortRef.current.abort(); };
  }, [poll]);

  useEffect(() => {
    if (round?.status === 'running' && round.running_started_at) {
      const startTime = new Date(round.running_started_at).getTime();
      const animate = () => {
        const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
        const raw = Math.exp(GROWTH_RATE * elapsed);
        const m = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 1_000_000) : 1.0;
        setMultiplier(m);

        (['1', '2'] as const).forEach(k => {
          const slot = Number(k) as 1 | 2;
          const bet = demoBets[slot];
          if (bet?.status === 'active' && bet.autoCashout && !demoAutoFiredRef.current[slot] && m >= bet.autoCashout) {
            demoAutoFiredRef.current[slot] = true;
            const payout = Math.round(bet.amount * bet.autoCashout * 100) / 100;
            setDemoBalance(b => b + payout);
            setDemoBets(prev => ({ ...prev, [slot]: { ...bet, status: 'cashed_out', cashoutMultiplier: bet.autoCashout, payout } }));
            playSound('cashout');
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

  // FIX: Safely check if betting_ends_at is valid to prevent "NaNs"
  const bettingEndsTime = round?.betting_ends_at ? new Date(round.betting_ends_at).getTime() : NaN;
  const secondsLeft = round?.status === 'betting' && !isNaN(bettingEndsTime) 
    ? Math.max(0, Math.ceil((bettingEndsTime - Date.now()) / 1000)) 
    : 0;

  const placeBet = async (slot: 1 | 2) => {
    const amount = parseFloat(betAmount[slot]);
    if (!round || round.status !== 'betting') { setError('Round is not accepting bets'); return; }
    if (!amount || amount < MIN_BET) { setError(`Minimum bet is $${MIN_BET}`); return; }
    if (activeBalance !== null && amount > activeBalance) { setError('Insufficient balance'); return; }

    if (accountMode === 'demo') {
      setDemoBalance(b => b - amount);
      setDemoBets(prev => ({ ...prev, [slot]: { amount, autoCashout: autoCashout[slot] ? parseFloat(autoCashout[slot]) : null, status: 'active', cashoutMultiplier: null, payout: null } }));
      demoAutoFiredRef.current[slot] = false;
      return;
    }

    if (!isAuthenticated) { setShowAuthPrompt(true); return; }
    setBusy(b => ({ ...b, [slot]: true })); setError('');
    const res = await fetch('/api/crash-game/bet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId: round.id, amount, autoCashout: autoCashout[slot] ? parseFloat(autoCashout[slot]) : null, slot }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to place bet'); else void poll();
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
    setBusy(b => ({ ...b, [slot]: true })); setError('');
    const res = await fetch('/api/crash-game/cashout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betId: bet.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to cash out'); else void poll();
    setBusy(b => ({ ...b, [slot]: false }));
  };

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 460;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#111116'); bg.addColorStop(0.5, '#181822'); bg.addColorStop(1, '#0e0e12');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y <= height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    const startX = width * 0.06, startY = height * 0.82, endX = width * 0.9, endY = height * 0.12;
    const progress = Math.min(Math.max((displayMultiplier - 1) / (FLIGHT_MAX_MULTIPLIER - 1), 0), 1);
    const plane = getPlanePosition(progress, startX, startY, endX, endY);
    const { cpX, cpY } = plane;

    const stateColor = gameState === 'crashed' ? '#ef4444' : gameState === 'running' ? '#22c55e' : '#8b5cf6';

    ctx.beginPath(); ctx.moveTo(startX, startY);
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * progress;
      const pt = getCurvePoint(t, startX, startY, cpX, cpY, endX, endY);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.shadowColor = stateColor; ctx.shadowBlur = 14;
    ctx.strokeStyle = stateColor; ctx.lineWidth = 2.5;
    ctx.stroke(); ctx.shadowBlur = 0;

    ctx.lineTo(plane.x, height); ctx.lineTo(startX, height); ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, endY, 0, startY);
    fillGrad.addColorStop(0, stateColor + '30'); fillGrad.addColorStop(1, stateColor + '00');
    ctx.fillStyle = fillGrad; ctx.fill();

    if (isFlying && Math.random() < 0.6) {
      particlesRef.current.push({ t: Math.max(0, progress - 0.01), offset: (Math.random() - 0.5) * 6, life: 1 });
    }
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    for (const p of particlesRef.current) {
      const pt = getCurvePoint(p.t, startX, startY, cpX, cpY, endX, endY);
      const size = (1 - p.life) * 10 + 3;
      ctx.beginPath();
      ctx.arc(pt.x - (1 - p.life) * 14, pt.y + p.offset + (1 - p.life) * 6, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,210,${p.life * 0.25})`;
      ctx.fill();
      p.life -= 0.02;
    }

    ctx.save();
    ctx.translate(plane.x, plane.y);
    ctx.rotate(plane.angle);
    ctx.scale(2.2, 2.2);

    if (isFlying) {
      const g = ctx.createRadialGradient(-16, 0, 0, -16, 0, 12);
      g.addColorStop(0, 'rgba(255,100,0,0.8)');
      g.addColorStop(0.5, 'rgba(255,200,0,0.4)');
      g.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-16, 0, 12, 0, Math.PI * 2); ctx.fill();
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

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fontSize = Math.min(width / 4.2, 76);
    ctx.font = `900 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = gameState === 'crashed' ? '#f87171' : '#ffffff';
    ctx.fillText(`${displayMultiplier.toFixed(2)}x`, width / 2, height * 0.38);

    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = gameState === 'running' ? '#4ade80' : gameState === 'crashed' ? '#f87171' : '#fbbf24';
    ctx.fillText(
      gameState === 'running' ? '● FLYING' : gameState === 'crashed' ? 'CRASHED' : `BETTING CLOSES IN ${secondsLeft}s`,
      width / 2, height * 0.55
    );
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText(`ROUND #${round?.round_number ?? '--'}`, width / 2, height * 0.94);
  }, [displayMultiplier, gameState, isFlying, round, secondsLeft]);

  useEffect(() => {
    let raf: number;
    const loop = () => { drawGame(); raf = requestAnimationFrame(loop); };
    loop();
    const resize = () => drawGame();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [drawGame]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0E0E12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <span className="ml-3 text-white/40">Connecting to Aviator...</span>
      </div>
    );
  }

  const renderSlot = (slot: 1 | 2) => {
    const bet = bets[slot];
    return (
      <div className="bg-[#14141A] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex justify-between items-center text-xs text-white/60 font-semibold">
          <span>BET {slot}</span><span>Min: ${MIN_BET}</span>
        </div>
        <input type="number" value={betAmount[slot]} onChange={e => setBetAmount(a => ({ ...a, [slot]: e.target.value }))}
          disabled={round?.status !== 'betting' || !!bet}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-lg outline-none focus:border-red-500 disabled:opacity-40" />
        <input type="text" placeholder="Auto cash-out e.g. 2.00" value={autoCashout[slot]} onChange={e => setAutoCashout(a => ({ ...a, [slot]: e.target.value }))}
          disabled={round?.status !== 'betting' || !!bet}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500 disabled:opacity-40" />
        <div className="grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.slice(0, 3).map(val => (
            <button key={val} onClick={() => setBetAmount(a => ({ ...a, [slot]: String(val) }))} disabled={round?.status !== 'betting' || !!bet}
              className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/80 disabled:opacity-40 transition">${val}</button>
          ))}
        </div>
        {bet?.status === 'active' ? (
          isFlying ? (
            <button onClick={() => cashout(slot)} disabled={busy[slot]}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-50">
              {busy[slot] ? 'Cashing out…' : `CASH OUT $${(('amount' in bet ? bet.amount : (bet as any).amount_usd) * multiplier).toFixed(2)}`}
            </button>
          ) : (
            <div className="w-full py-4 bg-white/5 border border-white/10 text-white/40 font-bold rounded-xl text-center text-sm">Waiting for takeoff…</div>
          )
        ) : bet?.status === 'cashed_out' ? (
          <div className="w-full py-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl text-center text-base">
            Won ${'payout' in bet ? bet.payout?.toFixed(2) : (bet as any).payout_usd?.toFixed(2)}
          </div>
        ) : bet?.status === 'lost' ? (
          <div className="w-full py-4 bg-red-950/40 border border-red-500/30 text-red-400 font-bold rounded-xl text-center text-base">Lost</div>
        ) : (
          <button onClick={() => placeBet(slot)} disabled={busy[slot] || round?.status !== 'betting'}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition disabled:opacity-40">
            {busy[slot] ? 'PLACING…' : round?.status === 'betting' ? `BET $${betAmount[slot] || 0}` : 'WAITING FOR NEXT ROUND'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0E0E12] text-white p-3 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-3 bg-[#16161D] px-5 py-3 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <Rocket className="w-7 h-7 text-red-500" />
            <h1 className="text-2xl font-black italic tracking-wider text-red-500">Aviator</h1>
            <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase border ${accountMode === 'real' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
              {accountMode === 'real' ? '● Real Money' : 'Demo Practice'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center">
              <button onClick={() => setAccountMode('demo')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${accountMode === 'demo' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'}`}>Demo</button>
              <button onClick={() => setAccountMode('real')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${accountMode === 'real' ? 'bg-emerald-500 text-black' : 'text-white/60 hover:text-white'}`}><ShieldCheck size={14} /> Real Money</button>
            </div>
            <button onClick={() => setSoundEnabled(s => !s)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition">
              {soundEnabled ? <Volume2 size={18} className="text-white/70" /> : <VolumeX size={18} className="text-white/40" />}
            </button>
            <div className="px-4 py-1.5 bg-black/40 rounded-xl border border-white/10 text-right min-w-[140px]">
              <p className="text-[10px] text-white/40 uppercase font-semibold">{accountMode} Balance</p>
              <p className={`text-base font-bold tabular-nums ${accountMode === 'real' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {activeBalance !== null ? `$${activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {accountMode === 'demo' && (
          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
            <p className="text-xs text-amber-300">Practice mode — this money isn't real.</p>
            <button onClick={() => { setDemoBalance(DEMO_START_BALANCE); setDemoBets({ 1: null, 2: null }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg transition">
              <RotateCcw size={12} /> Reset to ${DEMO_START_BALANCE.toLocaleString()}
            </button>
          </div>
        )}

        <div className="relative h-[420px] sm:h-[520px] bg-[#111116] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {renderSlot(1)}
          {renderSlot(2)}
        </div>
      </div>
    </div>
  );
}
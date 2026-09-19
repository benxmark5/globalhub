// app/components/football/SlipModal.tsx
"use client";

import { useRef, useState, type ReactElement } from 'react';
import { X, Copy, Check, Download, Trophy } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  signal: {
    league: string;
    home_team: string;
    away_team: string;
    kickoff_at: string;
    market_type: string;
    market_line: string | null;
    pick: string;
    odds: number;
    confidence: number | null;
    code: string;
  };
  username: string;
}

export default function SlipModal({ open, onClose, signal, username }: Props): ReactElement | null {
  const [copied, setCopied] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const kickoff = new Date(signal.kickoff_at);
  const kickoffStr = kickoff.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const slipText = [
    '━━━━━ GLOBALHUB SIGNAL ━━━━━',
    `🏆 ${signal.league}`,
    `${signal.home_team} vs ${signal.away_team}`,
    `🕐 ${kickoffStr}`,
    '',
    `Market: ${signal.market_type.replace(/_/g, ' ')}${signal.market_line ? ` (${signal.market_line})` : ''}`,
    `📊 Pick: ${signal.pick}`,
    `💰 Odds: ${signal.odds}`,
    signal.confidence !== null ? `⚡ Confidence: ${signal.confidence}%` : '',
    '',
    `Code: ${signal.code}`,
    '',
    `Good luck, ${username}! 🎯`,
    'Warm regards,',
    'The GlobalHub Team',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
  ].filter(Boolean).join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(slipText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = async () => {
    const node = slipRef.current;
    if (!node) return;

    try {
      // Use html2canvas-like approach without the dependency
      // Since we can't import html2canvas, we render manually via canvas API
      const canvas = document.createElement('canvas');
      const W = 800;
      const H = 1100;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, W, H);

      // Top accent bar
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(1, '#16a34a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 8);

      // Logo circle
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(W / 2, 100, 42, 0, Math.PI * 2);
      ctx.fill();

      // Logo text
      ctx.fillStyle = '#0a1628';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GH', W / 2, 100);

      // GlobalHub wordmark
      ctx.fillStyle = 'white';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('GLOBALHUB', W / 2, 175);

      // Signal label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('FOOTBALL SIGNAL', W / 2, 210);

      // Divider
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 245);
      ctx.lineTo(W - 80, 245);
      ctx.stroke();

      // League
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(signal.league.toUpperCase(), W / 2, 280);

      // Teams
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(signal.home_team, W / 2, 330);
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText('VS', W / 2, 365);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(signal.away_team, W / 2, 400);

      // Kickoff
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(kickoffStr, W / 2, 440);

      // Big card
      ctx.fillStyle = 'rgba(34,197,94,0.08)';
      ctx.strokeStyle = 'rgba(34,197,94,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const cardY = 490;
      const cardH = 320;
      const cardX = 70;
      const cardW = W - 140;
      const r = 20;
      ctx.moveTo(cardX + r, cardY);
      ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, r);
      ctx.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, r);
      ctx.arcTo(cardX, cardY + cardH, cardX, cardY, r);
      ctx.arcTo(cardX, cardY, cardX + cardW, cardY, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pick label
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('YOUR PICK', W / 2, cardY + 40);

      // Pick text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(signal.pick, W / 2, cardY + 100);

      // Market
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px sans-serif';
      const marketStr = `${signal.market_type.replace(/_/g, ' ')}${signal.market_line ? ` (${signal.market_line})` : ''}`;
      ctx.fillText(marketStr, W / 2, cardY + 145);

      // Odds + Confidence row
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`Odds: ${signal.odds}`, W / 2 - 130, cardY + 200);

      if (signal.confidence !== null) {
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`Confidence: ${signal.confidence}%`, W / 2 + 110, cardY + 200);
      }

      // Code box
      ctx.fillStyle = '#060f1e';
      ctx.beginPath();
      const codeY = cardY + 235;
      const codeH = 60;
      ctx.roundRect(140, codeY, W - 280, codeH, 12);
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('CODE', W / 2, codeY + 18);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(signal.code, W / 2, codeY + 42);

      // Welcome message
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Good luck, ${username}! 🎯`, W / 2, 900);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('Warm regards,', W / 2, 945);
      ctx.fillText('The GlobalHub Team', W / 2, 970);

      // Footer
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('globalhub.vercel.app', W / 2, 1040);

      // Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `globalhub-slip-${signal.code}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0a1628',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 20,
          maxWidth: 420,
          width: '100%',
          padding: 20,
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
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
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
          }}>
            <Trophy size={26} color="black" />
          </div>
          <h3 style={{ color: 'white', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
            Purchase Successful
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            Your signal slip is ready
          </p>
        </div>

        {/* The slip itself (visible preview) */}
        <div
          ref={slipRef}
          style={{
            background: '#060f1e',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <p style={{ color: '#22c55e', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em' }}>
              GLOBALHUB · FOOTBALL SIGNAL
            </p>
          </div>

          <p style={{ color: '#64748b', fontSize: 10, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {signal.league}
          </p>
          <p style={{ color: 'white', fontSize: 16, fontWeight: 900, textAlign: 'center', marginTop: 4 }}>
            {signal.home_team} vs {signal.away_team}
          </p>
          <p style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
            {kickoffStr}
          </p>

          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 12,
            padding: 14,
            marginTop: 14,
            textAlign: 'center',
          }}>
            <p style={{ color: '#86efac', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', marginBottom: 4 }}>
              YOUR PICK
            </p>
            <p style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>
              {signal.pick}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
              {signal.market_type.replace(/_/g, ' ')}
              {signal.market_line ? ` · ${signal.market_line}` : ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
              <div>
                <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>Odds</p>
                <p style={{ color: '#22c55e', fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>{signal.odds}</p>
              </div>
              {signal.confidence !== null && (
                <div>
                  <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>Confidence</p>
                  <p style={{ color: '#86efac', fontSize: 15, fontWeight: 900, fontFamily: 'monospace' }}>{signal.confidence}%</p>
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: '#0a1628',
            borderRadius: 10,
            padding: 10,
            marginTop: 12,
            textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Code</p>
            <p style={{ color: '#22c55e', fontSize: 15, fontWeight: 900, fontFamily: 'monospace', marginTop: 2 }}>
              {signal.code}
            </p>
          </div>

          <p style={{ color: 'white', textAlign: 'center', fontSize: 14, fontWeight: 700, marginTop: 16 }}>
            Good luck, {username}! 🎯
          </p>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: 11, marginTop: 4 }}>
            Warm regards,<br />The GlobalHub Team
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              flex: 1,
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
              border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#22c55e' : 'white',
              borderRadius: 11,
              padding: 12,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Slip'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              border: 'none',
              color: 'black',
              borderRadius: 11,
              padding: 12,
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Download size={14} />
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
}
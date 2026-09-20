// app/components/aviator/AviatorSlipModal.tsx
"use client";

import { useState, type ReactElement } from 'react';
import { X, Copy, Check, Download, Zap } from 'lucide-react';

type SlipSignal = {
  id: string;
  entry_point: number;
  exit_point: number;
  confidence: number;
  risk_level: string;
  position: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  packName: string;
  reference: string;
  price: number;
  signals: SlipSignal[];
  username: string;
};

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#fbbf24',
  HIGH: '#f87171',
};

export default function AviatorSlipModal({
  open,
  onClose,
  packName,
  reference,
  price,
  signals,
  username,
}: Props): ReactElement | null {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const purchasedAt = new Date();

  const slipText = [
    '━━━━━ GLOBALHUB · AVIATOR SLIP ━━━━━',
    `📦 ${packName}`,
    `👤 ${username}`,
    `💰 $${price.toFixed(2)} USD`,
    `🆔 ${reference}`,
    `🕐 ${purchasedAt.toLocaleString()}`,
    '',
    ...signals.map((s, i) =>
      [
        `── Signal ${i + 1} ──`,
        `   Entry:      ${s.entry_point.toFixed(2)}x`,
        `   Exit:       ${s.exit_point.toFixed(2)}x`,
        `   Confidence: ${s.confidence}%`,
        `   Risk:       ${s.risk_level}`,
      ].join('\n')
    ),
    '',
    `Good luck, ${username}! 🎯`,
    'Warm regards,',
    'The GlobalHub Team',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(slipText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = () => {
    try {
      const W = 800;
      const cardH = 90;
      const paddingTop = 260;
      const H = paddingTop + signals.length * cardH + 220;
      const canvas = document.createElement('canvas');
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

      // Wordmark
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('GLOBALHUB', W / 2, 170);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('AVIATOR SIGNAL SLIP', W / 2, 200);

      // Divider
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 230);
      ctx.lineTo(W - 80, 230);
      ctx.stroke();

      // Pack name
      ctx.fillStyle = 'white';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(packName, W / 2, 260);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${username} · $${price.toFixed(2)} USD · ${purchasedAt.toLocaleString()}`, W / 2, 285);

      // Signals
      let y = paddingTop;
      signals.forEach((s, i) => {
        // Card background
        ctx.fillStyle = 'rgba(34,197,94,0.06)';
        ctx.strokeStyle = 'rgba(34,197,94,0.2)';
        ctx.lineWidth = 1;
        const cardY = y - 40;
        const cardX = 70;
        const cardW = W - 140;
        const r = 12;
        ctx.beginPath();
        ctx.moveTo(cardX + r, cardY);
        ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + 80, r);
        ctx.arcTo(cardX + cardW, cardY + 80, cardX, cardY + 80, r);
        ctx.arcTo(cardX, cardY + 80, cardX, cardY, r);
        ctx.arcTo(cardX, cardY, cardX + cardW, cardY, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Signal number
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SIGNAL ${i + 1}`, cardX + 20, cardY + 22);

        // Entry
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('ENTRY', cardX + 20, cardY + 45);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${s.entry_point.toFixed(2)}x`, cardX + 20, cardY + 65);

        // Exit
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('EXIT TARGET', cardX + 180, cardY + 45);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${s.exit_point.toFixed(2)}x`, cardX + 180, cardY + 65);

        // Confidence
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('CONFIDENCE', cardX + 340, cardY + 45);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${s.confidence}%`, cardX + 340, cardY + 65);

        // Risk badge
        ctx.fillStyle = RISK_COLORS[s.risk_level] || '#64748b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(s.risk_level, cardX + cardW - 70, cardY + 55);

        ctx.textAlign = 'center';
        y += cardH;
      });

      // Footer
      const footerY = y + 40;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`Good luck, ${username}! 🎯`, W / 2, footerY);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.fillText('Warm regards,', W / 2, footerY + 30);
      ctx.fillText('The GlobalHub Team', W / 2, footerY + 52);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('globalhub.vercel.app', W / 2, H - 30);

      // Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `globalhub-aviator-slip-${reference}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error('Slip image generation failed:', e);
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
          maxWidth: 440,
          width: '100%',
          padding: 20,
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
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
            zIndex: 2,
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
            <Zap size={26} color="black" />
          </div>
          <h3 style={{ color: 'white', fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
            Purchase Successful
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            Your Aviator slip is ready
          </p>
        </div>

        {/* The slip (visible preview) */}
        <div style={{
          background: '#060f1e',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <p style={{ color: '#22c55e', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em' }}>
              GLOBALHUB · AVIATOR SLIP
            </p>
          </div>

          <p style={{ color: 'white', fontSize: 16, fontWeight: 900, textAlign: 'center' }}>
            {packName}
          </p>
          <p style={{ color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
            {username} · ${price.toFixed(2)} USD
          </p>
          <p style={{ color: '#475569', fontSize: 10, textAlign: 'center', fontFamily: 'monospace', marginTop: 4 }}>
            {reference}
          </p>

          {/* Signals */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {signals.map((s, i) => (
              <div
                key={s.id}
                style={{
                  background: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>
                    SIGNAL {i + 1}
                  </span>
                  <span style={{
                    color: RISK_COLORS[s.risk_level] || '#64748b',
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                  }}>
                    {s.risk_level}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>Entry</p>
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>
                      {s.entry_point.toFixed(2)}x
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>Exit</p>
                    <p style={{ color: '#22c55e', fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>
                      {s.exit_point.toFixed(2)}x
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>Confidence</p>
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 800, fontFamily: 'monospace' }}>
                      {s.confidence}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
// app/components/DraggableChatBubble.tsx
"use client";

import { useState, useEffect, useRef, type ReactElement } from 'react';
import { MessageCircle } from 'lucide-react';

interface Props {
  /** Initial position from bottom-right (px). */
  defaultOffset?: { x: number; y: number };
  /** Size of the bubble. */
  size?: number;
  /** Called when tapped (not dragged). */
  onTap: () => void;
  /** Optional badge count. */
  badge?: number;
}

export default function DraggableChatBubble({
  defaultOffset = { x: 16, y: 20 },
  size = 54,
  onTap,
  badge = 0,
}: Props): ReactElement {
  const [pos, setPos] = useState(defaultOffset);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });
  const [loaded, setLoaded] = useState(false);

  // Load saved position
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_bubble_pos');
      if (saved) {
        const parsed = JSON.parse(saved) as { x: number; y: number };
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          parsed.x >= 0 && parsed.x <= 300 &&
          parsed.y >= 0 && parsed.y <= 300
        ) {
          setPos(parsed);
        }
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Save position when it changes
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('chat_bubble_pos', JSON.stringify(pos)); } catch { /* ignore */ }
  }, [pos, loaded]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.moved = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.origX = pos.x;
    dragRef.current.origY = pos.y;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
    }
    // dx increases right, but offset.x is from right edge
    const nextX = Math.max(0, Math.min(dragRef.current.origX - dx, window.innerWidth - size - 8));
    const nextY = Math.max(0, Math.min(dragRef.current.origY - dy, window.innerHeight - size - 8));
    setPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const wasDrag = dragRef.current.moved;
    dragRef.current.dragging = false;
    dragRef.current.moved = false;
    // Only open chat if it was a tap, not a drag
    if (!wasDrag) onTap();
  };

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current.dragging = false;
        dragRef.current.moved = false;
      }}
      style={{
        position: 'fixed',
        bottom: `${pos.y}px`,
        right: `${pos.x}px`,
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
        border: 'none',
        borderRadius: '50%',
        cursor: 'grab',
        zIndex: 999,
        boxShadow: '0 8px 25px rgba(34,197,94,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: dragRef.current.dragging ? 'none' : 'transform 0.15s',
      }}
    >
      <MessageCircle size={22} color="white" />
      {badge > 0 && (
        <span style={{
          position: 'absolute',
          top: '-3px',
          right: '-3px',
          width: '18px',
          height: '18px',
          background: '#ef4444',
          borderRadius: '50%',
          fontSize: '10px',
          fontWeight: 900,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
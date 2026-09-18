// app/components/ChatWidget.tsx
"use client";
import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DraggableChatBubble from './DraggableChatBubble';

type Message = { role: 'user' | 'assistant'; content: string };

const QUICK = [
  'How much do signals cost?',
  'What is my balance?',
  'Where is my withdrawal?',
  'How do I contact support?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! 👋 I'm GlobalHub's AI assistant. Ask me anything about signals, payments, or your account!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [open, messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Get current user (if logged in) for personalized responses
      let userId: string | undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch { /* not logged in */ }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, userId }),
      });

      const data = await res.json();
      const reply = data.reply ||
        "I couldn't get a response. Try again or email support.globalhub.team@gmail.com";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Connection error. Please email support.globalhub.team@gmail.com for help!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '86px',
          right: '16px',
          width: '320px',
          maxWidth: 'calc(100vw - 32px)',
          height: minimized ? 'auto' : '460px',
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '20px',
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            background: '#0a1628',
            borderBottom: '1px solid #1a2740',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>
                🤖
              </div>
              <div>
                <p style={{ fontWeight: 900, fontSize: '14px', color: 'white', margin: 0 }}>
                  GlobalHub AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />
                  <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setMinimized(!minimized)}
                style={{
                  background: 'none', border: 'none', color: '#6b7280',
                  cursor: 'pointer', padding: '6px', borderRadius: '8px',
                  touchAction: 'manipulation',
                }}
              >
                <Minimize2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', color: '#6b7280',
                  cursor: 'pointer', padding: '6px', borderRadius: '8px',
                  touchAction: 'manipulation',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {m.role === 'assistant' && (
                      <div style={{
                        width: '26px', height: '26px',
                        background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                        borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px',
                        marginRight: '8px', marginTop: '2px',
                      }}>
                        🤖
                      </div>
                    )}
                    <div style={{
                      maxWidth: '82%',
                      background: m.role === 'user' ? '#22c55e' : '#1a2740',
                      color: m.role === 'user' ? 'black' : 'white',
                      padding: '10px 13px',
                      borderRadius: m.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      width: '26px', height: '26px',
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px',
                    }}>
                      🤖
                    </div>
                    <div style={{
                      background: '#1a2740',
                      padding: '12px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      display: 'flex', gap: '4px',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '7px', height: '7px',
                          background: '#6b7280', borderRadius: '50%',
                          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {messages.length === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{
                      color: '#374151', fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '2px',
                    }}>
                      Quick questions:
                    </p>
                    {QUICK.map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        style={{
                          background: '#0a1628',
                          border: '1px solid #1a2740',
                          borderRadius: '10px',
                          padding: '9px 12px',
                          color: '#9ca3af',
                          fontSize: '13px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          touchAction: 'manipulation',
                          transition: 'all 0.2s',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '10px 12px',
                borderTop: '1px solid #1a2740',
                display: 'flex',
                gap: '8px',
                flexShrink: 0,
                background: '#0a1628',
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask anything..."
                  style={{
                    flex: 1,
                    background: '#0f1f33',
                    border: '1px solid #1a2740',
                    borderRadius: '10px',
                    padding: '10px 13px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    WebkitAppearance: 'none' as const,
                  }}
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{
                    background: input.trim() && !loading ? '#22c55e' : '#1a2740',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: input.trim() && !loading ? 'black' : '#374151',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    touchAction: 'manipulation',
                    flexShrink: 0,
                  }}
                >
                  <Send size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Draggable Float Button */}
      {!open && (
        <DraggableChatBubble
          onTap={() => { setOpen(true); setMinimized(false); }}
          badge={unread}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
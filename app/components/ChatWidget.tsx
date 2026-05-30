"use client";
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are GlobalHub's friendly AI support assistant. GlobalHub is a professional sports signals platform operating worldwide.

Key facts about GlobalHub:
- Provides football signals and Aviator game signals
- Football signals: Normal $2.50, Big Game $4.30, Super $6.00
- Aviator signals: $3 per signal, bundles available
- Payment via Paystack (cards, M-Pesa, mobile money worldwide)
- Signals valid 24 hours after purchase (Aviator: 2 hours)
- Available in 100+ countries, 10 languages
- Support email: support.globalhub.team@gmail.com
- No subscription — pay per signal
- Users must be 18+
- 94% accuracy rate on football signals

Be helpful, friendly, and concise. If you cannot answer something specific, direct users to support.globalhub.team@gmail.com. Always encourage responsible gaming. Keep responses brief (2-4 sentences max).`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm GlobalHub's AI assistant. How can I help you today? Ask me about signals, payments, or anything else!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: text }
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text ||
        "I'm having trouble responding. Email support.globalhub.team@gmail.com for help!";

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply }
      ]);

      if (!open) setUnread(prev => prev + 1);

    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having a technical issue. Please email support.globalhub.team@gmail.com for help!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'How much do signals cost?',
    'How does payment work?',
    'Are signals guaranteed?',
    'How long are signals valid?',
  ];

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '90px', right: '16px',
          width: '340px',
          maxWidth: 'calc(100vw - 32px)',
          height: minimized ? 'auto' : '480px',
          background: '#0f1f33',
          border: '1px solid #1a2740',
          borderRadius: '20px',
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column'
        }}>

          {/* Chat Header */}
          <div style={{
            background: '#0a1628',
            borderBottom: '1px solid #1a2740',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px'
              }}>
                🤖
              </div>
              <div>
                <p style={{
                  fontWeight: 900, fontSize: '14px', color: 'white'
                }}>
                  GlobalHub AI
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                  <span style={{
                    width: '6px', height: '6px',
                    background: '#22c55e', borderRadius: '50%'
                  }} />
                  <span style={{
                    color: '#22c55e', fontSize: '11px', fontWeight: 700
                  }}>
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="button"
                onClick={() => setMinimized(!minimized)}
                style={{
                  background: 'none', border: 'none',
                  color: '#6b7280', cursor: 'pointer',
                  padding: '6px', borderRadius: '8px',
                  touchAction: 'manipulation'
                }}>
                <Minimize2 size={16} />
              </button>
              <button type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none',
                  color: '#6b7280', cursor: 'pointer',
                  padding: '6px', borderRadius: '8px',
                  touchAction: 'manipulation'
                }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '16px', display: 'flex',
                flexDirection: 'column', gap: '12px'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user'
                      ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      maxWidth: '85%',
                      background: msg.role === 'user'
                        ? '#22c55e' : '#1a2740',
                      color: msg.role === 'user'
                        ? 'black' : 'white',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                      fontSize: '14px', lineHeight: 1.6
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex' }}>
                    <div style={{
                      background: '#1a2740', padding: '10px 16px',
                      borderRadius: '18px 18px 18px 4px',
                      display: 'flex', gap: '4px',
                      alignItems: 'center'
                    }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: '6px', height: '6px',
                          background: '#6b7280', borderRadius: '50%',
                          animation: `bounce 1s ${i * 0.2}s infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick questions */}
                {messages.length === 1 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <p style={{
                      color: '#6b7280', fontSize: '11px',
                      textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      Quick questions:
                    </p>
                    {quickQuestions.map(q => (
                      <button key={q} type="button"
                        onClick={() => {
                          setInput(q);
                          setTimeout(() => {
                            setInput('');
                            setMessages(prev => [
                              ...prev,
                              { role: 'user', content: q }
                            ]);
                          }, 0);
                        }}
                        style={{
                          background: '#0a1628',
                          border: '1px solid #1a2740',
                          borderRadius: '10px', padding: '8px 12px',
                          color: '#9ca3af', fontSize: '13px',
                          cursor: 'pointer', textAlign: 'left',
                          touchAction: 'manipulation'
                        }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 14px',
                borderTop: '1px solid #1a2740',
                display: 'flex', gap: '8px',
                flexShrink: 0
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask anything..."
                  style={{
                    flex: 1, background: '#0a1628',
                    border: '1px solid #1a2740',
                    borderRadius: '10px', padding: '10px 14px',
                    color: 'white', fontSize: '14px',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || loading}
                  style={{
                    background: input.trim() && !loading
                      ? '#22c55e' : '#1a2740',
                    border: 'none', borderRadius: '10px',
                    padding: '10px 12px',
                    color: input.trim() && !loading
                      ? 'black' : '#374151',
                    cursor: input.trim() && !loading
                      ? 'pointer' : 'not-allowed',
                    touchAction: 'manipulation',
                    flexShrink: 0
                  }}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Float Button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setMinimized(false);
        }}
        style={{
          position: 'fixed', bottom: '20px', right: '16px',
          width: '56px', height: '56px',
          background: 'linear-gradient(135deg,#22c55e,#16a34a)',
          border: 'none', borderRadius: '50%',
          cursor: 'pointer', zIndex: 999,
          boxShadow: '0 8px 25px rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
          transition: 'all 0.3s'
        }}>
        {open
          ? <X size={24} color="white" />
          : <MessageCircle size={24} color="white" />
        }
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            width: '20px', height: '20px',
            background: '#ef4444', borderRadius: '50%',
            fontSize: '11px', fontWeight: 900, color: 'white',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unread}
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
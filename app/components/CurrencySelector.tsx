"use client";
import { useState } from 'react';
import { CURRENCY_MAP, CurrencyInfo } from '@/lib/currency';
import { Globe, ChevronDown, X, Search } from 'lucide-react';

interface Props {
  current: CurrencyInfo;
  onChange: (c: CurrencyInfo) => void;
  compact?: boolean;
}

// Popular currencies shown first
const POPULAR = ['USD','GBP','EUR','KES','NGN','GHS','ZAR','CAD','AUD','INR','AED','BRL'];

export default function CurrencySelector({ current, onChange, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const all = Object.values(CURRENCY_MAP);
  
  // Deduplicate popular items by finding the first matching country profile
  const popular = POPULAR.map(c => all.find(x => x.code === c)).filter(Boolean) as CurrencyInfo[];
  const others = all.filter(x => !POPULAR.includes(x.code));

  const filtered = (list: CurrencyInfo[]) =>
    search.trim()
      ? list.filter(c =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.country.toLowerCase().includes(search.toLowerCase())
        )
      : list;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#0f1f33', border: '1px solid #1a2740',
          borderRadius: '10px',
          padding: compact ? '6px 10px' : '8px 14px',
          color: 'white', cursor: 'pointer',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 700, touchAction: 'manipulation',
          transition: 'border-color 0.2s'
        }}
      >
        <Globe size={compact ? 12 : 14} color="#22c55e" />
        <span>{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown size={12} color="#6b7280" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => { setOpen(false); setSearch(''); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 998,
              background: 'rgba(0,0,0,0.5)'
            }}
          />

          {/* Dropdown */}
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '80vh',
            background: '#0a1628',
            border: '1px solid #1a2740',
            borderRadius: '18px',
            zIndex: 999,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>

            {/* Header */}
            <div style={{
              padding: '16px', borderBottom: '1px solid #1a2740',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexShrink: 0
            }}>
              <p style={{ fontWeight: 900, fontSize: '15px', color: 'white' }}>
                Select Currency
              </p>
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(''); }}
                style={{
                  background: 'none', border: 'none',
                  color: '#6b7280', cursor: 'pointer',
                  padding: '4px', touchAction: 'manipulation'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #1a2740', flexShrink: 0
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#0f1f33', border: '1px solid #1a2740',
                borderRadius: '10px', padding: '8px 12px'
              }}>
                <Search size={14} color="#6b7280" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search currency or country..."
                  autoFocus
                  style={{
                    background: 'none', border: 'none',
                    color: 'white', fontSize: '13px',
                    outline: 'none', width: '100%'
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {!search && (
                <p style={{
                  padding: '10px 16px 4px',
                  color: '#374151', fontSize: '10px',
                  fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  Popular
                </p>
              )}

              {filtered(!search ? popular : [...popular, ...others]).map(c => (
                <button
                  key={`popular-${c.countryCode}`}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', display: 'flex',
                    alignItems: 'center', gap: '12px',
                    padding: '12px 16px', border: 'none',
                    background: current.code === c.code
                      ? 'rgba(34,197,94,0.08)' : 'transparent',
                    borderLeft: current.code === c.code
                      ? '3px solid #22c55e' : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    touchAction: 'manipulation'
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{c.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: '13px',
                      color: current.code === c.code ? '#22c55e' : 'white'
                    }}>
                      {c.code} — {c.name}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '11px' }}>
                      {c.country}
                    </p>
                  </div>
                  <span style={{
                    color: '#374151', fontSize: '12px',
                    fontFamily: 'monospace', flexShrink: 0
                  }}>
                    {c.symbol}
                  </span>
                </button>
              ))}

              {!search && (
                <>
                  <p style={{
                    padding: '10px 16px 4px',
                    color: '#374151', fontSize: '10px',
                    fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    All Currencies
                  </p>
                  
                  {filtered(others).map(c => (
                    <button
                      key={`other-${c.countryCode}`}
                      type="button"
                      onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                      style={{
                        width: '100%', display: 'flex',
                        alignItems: 'center', gap: '12px',
                        padding: '10px 16px', border: 'none',
                        background: current.code === c.code
                          ? 'rgba(34,197,94,0.08)' : 'transparent',
                        borderLeft: current.code === c.code
                          ? '3px solid #22c55e' : '3px solid transparent',
                        cursor: 'pointer', textAlign: 'left',
                        touchAction: 'manipulation'
                      }}
                    >
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{c.flag}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: 600, fontSize: '13px',
                          color: current.code === c.code ? '#22c55e' : '#d1d5db'
                        }}>
                          {c.code} — {c.name}
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '11px' }}>
                          {c.country}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
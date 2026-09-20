// app/marketplace/page.tsx
"use client";

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import { TrendingUp, Zap, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import FootballTab from '../components/football/FootballTab';
import AviatorTab from '../components/aviator/AviatorTab';

export default function MarketplacePage(): ReactElement {
  const { count: cartCount } = useCart();
  const [tab, setTab] = useState<'football' | 'aviator'>('football');

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '24px 16px 40px',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          color: 'var(--text)',
          marginBottom: 6,
          letterSpacing: '-0.02em',
        }}>
          Marketplace
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Choose your signals — pay per signal, no subscriptions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
        maxWidth: 400,
      }}>
        <button
          type="button"
          onClick={() => setTab('football')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 16px',
            border: 'none',
            borderRadius: 10,
            background: tab === 'football' ? 'var(--brand)' : 'transparent',
            color: tab === 'football' ? '#000' : 'var(--text-muted)',
            fontWeight: 900,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <TrendingUp size={15} />
          Football
        </button>
        <button
          type="button"
          onClick={() => setTab('aviator')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 16px',
            border: 'none',
            borderRadius: 10,
            background: tab === 'aviator' ? 'var(--brand)' : 'transparent',
            color: tab === 'aviator' ? '#000' : 'var(--text-muted)',
            fontWeight: 900,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Zap size={15} />
          Aviator
        </button>
      </div>

      {/* Content per tab */}
      {tab === 'football' ? <FootballTab /> : <AviatorTab />}

      {/* Go to cart */}
      {cartCount > 0 && (
        <div style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <Link
            href="/cart"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--brand)',
              color: 'black',
              padding: '12px 20px',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            <Package size={16} />
            View Cart ({cartCount})
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
// app/marketplace/page.tsx
"use client";

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Zap, ShoppingCart, Check, Star,
  ArrowRight, Package,
} from 'lucide-react';
import { useCart } from '@/lib/cart';
import FootballTab from '../components/football/FootballTab';

interface Plan {
  id: string;
  signalType: 'football' | 'aviator';
  label: string;
  sublabel: string;
  priceUSD: number;
  signalsCount: number;
  badge?: string;
  popular?: boolean;
}

// Aviator packs (football signals come from DB via FootballTab)
const PLANS: Plan[] = [
  { id: 'aviator-1',  signalType: 'aviator', label: 'Single',     sublabel: '1 signal',  priceUSD: 3,  signalsCount: 1 },
  { id: 'aviator-4',  signalType: 'aviator', label: 'Pack of 4',  sublabel: '4 signals', priceUSD: 10, signalsCount: 4, badge: 'Best Value', popular: true },
  { id: 'aviator-8',  signalType: 'aviator', label: 'Pack of 8',  sublabel: '8 signals', priceUSD: 18, signalsCount: 8 },
  { id: 'aviator-12', signalType: 'aviator', label: 'Pack of 12', sublabel: '12 signals', priceUSD: 25, signalsCount: 12 },
];

export default function MarketplacePage(): ReactElement {
  const { addItem, count: cartCount, isInCart } = useCart();
  const [tab, setTab] = useState<'football' | 'aviator'>('football');

  const plans = PLANS.filter(p => p.signalType === 'aviator');
  const aviatorCount = plans.length;

  const handleBuy = (plan: Plan) => {
    addItem({
      id: plan.id,
      title: `Aviator · ${plan.label}`,
      name: `Aviator · ${plan.label}`,
      price: plan.priceUSD,
      quantity: 1,
      signalType: plan.signalType,
      signalsCount: plan.signalsCount,
    });
  };

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
          <span style={{
            fontSize: 10,
            background: tab === 'aviator' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.06)',
            padding: '1px 6px',
            borderRadius: 6,
          }}>
            {aviatorCount}
          </span>
        </button>
      </div>

      {/* Content per tab */}
      {tab === 'football' ? (
        <FootballTab />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {plans.map(plan => {
            const inCart = isInCart(plan.id);
            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  background: plan.popular
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, var(--surface) 60%)'
                    : 'var(--surface)',
                  border: plan.popular
                    ? '1px solid rgba(34,197,94,0.35)'
                    : '1px solid var(--border-strong)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'all 0.2s',
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: plan.popular ? 'var(--brand)' : 'rgba(34,197,94,0.15)',
                    color: plan.popular ? 'black' : 'var(--brand)',
                    fontSize: 9,
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    {plan.popular && <Star size={9} fill="currentColor" />}
                    {plan.badge}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(248,113,113,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Zap size={18} color="#f87171" />
                  </div>
                  <div>
                    <p style={{ color: 'var(--text)', fontWeight: 900, fontSize: 15 }}>
                      {plan.label}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {plan.sublabel}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    color: 'var(--brand)',
                    fontWeight: 900,
                    fontSize: 28,
                    fontFamily: 'monospace',
                    letterSpacing: '-0.02em',
                  }}>
                    ${plan.priceUSD.toFixed(2)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>USD</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    `${plan.signalsCount} signal${plan.signalsCount > 1 ? 's' : ''}`,
                    'Valid 24 hours',
                    'Instant delivery',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                      <Check size={12} color="var(--brand)" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(plan)}
                  disabled={inCart}
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '11px',
                    background: inCart
                      ? 'rgba(34,197,94,0.12)'
                      : plan.popular ? 'var(--brand)' : 'var(--surface)',
                    color: inCart
                      ? 'var(--brand)'
                      : plan.popular ? 'black' : 'var(--text)',
                    border: plan.popular && !inCart ? 'none' : '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 10,
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: inCart ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s',
                  }}
                >
                  {inCart ? (
                    <><Check size={14} /> In Cart</>
                  ) : (
                    <><ShoppingCart size={14} /> Add to Cart</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

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
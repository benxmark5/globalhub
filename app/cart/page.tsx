"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCurrency } from '../lib/useCurrency';
import { toLocalAmount, formatAmount } from '../lib/currency';

// Simple types for cart processing
interface CartItem {
  id: string;
  name: string;
  price: number; // in USD
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const { currency, loading: currencyLoading } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from local storage cart instance on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart contents:", e);
    }
    setLoading(false);
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    // Dispatch event to update navbar numbers dynamically if hooked up
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    saveCart(filtered);
  };

  const subtotalUSD = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const localizedSubtotal = toLocalAmount(subtotalUSD, currency);

  if (loading || currencyLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#070f1e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading cart information...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070f1e', color: 'white', padding: '24px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header link back */}
        <Link href="/aviator" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#22c55e', textDecoration: 'none', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Games
        </Link>

        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '32px' }}>Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <ShoppingBag size={48} color="#374151" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>Your cart is currently empty.</p>
            <Link href="/aviator" style={{ display: 'inline-block', background: '#22c55e', color: 'black', fontWeight: 800, padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
              Shop Packages
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* List block */}
            <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '16px', overflow: 'hidden' }}>
              {items.map((item) => {
                const itemLocalPrice = toLocalAmount(item.price, currency);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderBottom: '1px solid #1a2740' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{item.name}</h3>
                      <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: 700 }}>
                        {formatAmount(itemLocalPrice, currency)} each
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0f1f33', border: '1px solid #1a2740', borderRadius: '8px' }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', color: 'white', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>

                    {/* Price total */}
                    <div style={{ width: '100px', textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, fontSize: '15px' }}>
                        {formatAmount(itemLocalPrice * item.quantity, currency)}
                      </p>
                    </div>

                    {/* Delete item */}
                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary total section */}
            <div style={{ background: '#0a1628', border: '1px solid #1a2740', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Subtotal:</span>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>
                  {formatAmount(localizedSubtotal, currency)}
                </span>
              </div>
              
              <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'black', fontWeight: 800, padding: '14px 32px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', width: '100%', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}>
                Proceed to Checkout <CreditCard size={16} />
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
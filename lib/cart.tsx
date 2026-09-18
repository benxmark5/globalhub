"use client";
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type CartItem = {
  id: string;
  title?: string;
  name?: string;
  price: number;
  quantity?: number;
  [key: string]: any;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gh_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Save to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('gh_cart', JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const qty = item.quantity || 1;
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + qty } : i);
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const isInCart = (id: string) => items.some(item => item.id === id);

  const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

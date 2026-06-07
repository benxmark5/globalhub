"use client";

import { 
  createContext, useContext, 
  useState, ReactNode 
} from 'react';
import { supabase } from '../lib/supabase';

type CartItem = {
  id: string;
  type: 'football' | 'aviator';
  name: string;
  price: number;
  league?: string;
  home?: string;
  away?: string;
  tier?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextType>({
  items: [], addItem: () => {}, removeItem: () => {},
  clearCart: () => {}, total: 0, count: 0,
  isInCart: () => false,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price, 0);
  const count = items.length;
  const isInCart = (id: string) => 
    items.some(i => i.id === id);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem,
      clearCart, total, count, isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
'use client';

import React, { createContext, useContext, useState } from 'react';

interface CartContextType {
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (item: any) => setCart((prev) => [...prev, item]);
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  return React.createElement(
    CartContext.Provider,
    { value: { cart, addToCart, removeFromCart, clearCart } },
    children
  );
};

export const useCart = () => useContext(CartContext);

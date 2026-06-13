import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null as any);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(items)); }, [items]);

  function addItem(product, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...product, quantity }];
    });
  }

  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)); }

  function updateQty(id, quantity) {
    if (quantity < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  }

  function clearCart() { setItems([]); }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

// CartContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { trackAddToCart, trackRemoveFromCart } from '../utils/gtmTracking';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        // Increase quantity
        trackAddToCart(product, 1); // Track additional qty
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      trackAddToCart(product, 1); // Track first add
      return [...items, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // open cart on add
  };

  const removeFromCart = (productId) => {
    const productToRemove = cartItems.find(item => item.id === productId);
    if (productToRemove) {
      trackRemoveFromCart(productToRemove, productToRemove.quantity);
    }

  const toggleCart = () => setIsCartOpen((open) => !open);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, isCartOpen, toggleCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

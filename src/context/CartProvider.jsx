'use client';

// context/CartProvider.jsx
import { useState } from 'react';
import { CartContext } from '@/context/CartContext';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ── Add to cart ──────────────────────────────────────────────
  // Works for both:
  //   • ProductDetails (passes productKey, variant, qty, total)
  //   • Simple add (just product with id)
  const addToCart = (product) => {
    setCartItems((prev) => {
      // Match by id + selectedVariant so same food with different size = different item
      const existing = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedVariant === (product.selectedVariant || null)
      );

      if (existing) {
        // ✅ Increase qty and recalculate total
        return prev.map((item) =>
          item.id === product.id &&
          item.selectedVariant === (product.selectedVariant || null)
            ? {
                ...item,
                qty: item.qty + (product.qty || 1),
                total: (item.qty + (product.qty || 1)) * item.price,
              }
            : item
        );
      }

      // ✅ New item — ensure qty and total are always set
      return [
        ...prev,
        {
          ...product,
          qty: product.qty || 1,
          total: product.total || product.price * (product.qty || 1),
          selectedVariant: product.selectedVariant || null,
        },
      ];
    });
  };

  // ── Remove item ──────────────────────────────────────────────
  // Supports both:
  //   • removeFromCart(id)                  — simple (old style)
  //   • removeFromCart(productKey, size)    — with variants
  const removeFromCart = (idOrKey, size) => {
    setCartItems((prev) => {
      if (size !== undefined) {
        // variant-aware removal
        return prev.filter(
          (item) =>
            !(
              (item.productKey === idOrKey || item.id === idOrKey) &&
              (item.variant?.size === size || item.selectedVariant === size)
            )
        );
      }
      // simple id removal
      return prev.filter((item) => item.id !== idOrKey);
    });
  };

  // ── Update quantity ──────────────────────────────────────────
  // Supports both:
  //   • updateQuantity(id, newQty)           — simple (old style)
  //   • updateQty(productKey, size, newQty)  — with variants
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, qty: newQuantity, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const updateQty = (productKey, size, newQty) => {
    if (newQty < 1) {
      removeFromCart(productKey, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (item.productKey === productKey || item.id === productKey) &&
        (item.variant?.size === size || item.selectedVariant === size)
          ? { ...item, qty: newQty, quantity: newQty, total: newQty * item.price }
          : item
      )
    );
  };

  // ── Clear entire cart ────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ── Derived values ───────────────────────────────────────────
  // ✅ cartCount — total number of items (for Navbar badge)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);

  const WEBSITE_FEE = 50;

  // ✅ cartTotal — total price (for Cart page)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.total || item.price * (item.qty || item.quantity || 1)),
    0) + WEBSITE_FEE;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity, // ← old name (keeps ProductDetails working)
        updateQty,      // ← new name (used in Cart.jsx)
        clearCart,
        cartCount,      // ← for Navbar badge
        cartTotal,      // ← for Cart page total
        websiteFee: WEBSITE_FEE,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

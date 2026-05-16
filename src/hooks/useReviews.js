'use client';

// hooks/useReviews.js
import { useState, useEffect } from 'react';

// ── Helpers ──────────────────────────────────────────────────────
const getStoredReviews = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('dt_reviews')) || {};
  } catch {
    return {};
  }
};

const getStoredPurchases = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('dt_purchases')) || [];
  } catch {
    return [];
  }
};

// ── Hook ─────────────────────────────────────────────────────────
export const useReviews = (productId) => {
  const [allReviews, setAllReviews] = useState({});
  const [purchases, setPurchases]   = useState([]);

  // Load from localStorage on mount (client-only — avoids SSR crash)
  useEffect(() => {
    setAllReviews(getStoredReviews());
    setPurchases(getStoredPurchases());
  }, []);

  // Reviews for this specific product
  const reviews = allReviews[productId] || [];

  // Average rating for this product
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Has the current user purchased this product?
  const hasPurchased = purchases.includes(String(productId));

  // Has the current user already reviewed this product?
  const hasReviewed = reviews.some((r) => r.isOwn);

  // ── Add a review ────────────────────────────────────────────
  const addReview = ({ name, rating, comment }) => {
    const newReview = {
      id:       Date.now(),
      name:     name.trim(),
      rating,
      comment:  comment.trim(),
      date:     new Date().toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric'
                }),
      isOwn:    true, // marks this device's review
      verified: true,
    };

    const updated = {
      ...allReviews,
      [productId]: [newReview, ...(allReviews[productId] || [])],
    };

    localStorage.setItem('dt_reviews', JSON.stringify(updated));
    setAllReviews(updated);
  };

  // ── Mark product as purchased (call this in OrderConfirmation) ─
  const markPurchased = (pid) => {
    const updated = [...new Set([...purchases, String(pid)])];
    localStorage.setItem('dt_purchases', JSON.stringify(updated));
    setPurchases(updated);
  };

  return {
    reviews,
    avgRating,
    reviewCount: reviews.length,
    hasPurchased,
    hasReviewed,
    addReview,
    markPurchased,
  };
};

// ── Standalone helper to mark ALL cart items as purchased ────────
// Call this in OrderConfirmation.jsx after successful payment
export const markAllPurchased = (cartItems) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('dt_purchases')) || [];
    const ids = cartItems.map((i) => String(i.id));
    const updated = [...new Set([...existing, ...ids])];
    localStorage.setItem('dt_purchases', JSON.stringify(updated));
  } catch {
    console.error('Failed to mark purchases');
  }
};

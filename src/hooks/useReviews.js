'use client';

// hooks/useReviews.js
// Reviews are now stored in Firestore — visible to ALL users on ALL devices.
// localStorage is still used only for tracking purchases on this device.

import { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── localStorage helpers (purchases only) ────────────────────────
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
  const [reviews, setReviews]     = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]     = useState(true);

  // ── Load purchases from localStorage (device-specific) ──────
  useEffect(() => {
    setPurchases(getStoredPurchases());
  }, []);

  // ── Load reviews from Firestore in real-time ─────────────────
  useEffect(() => {
    if (!productId) return;

    const q = query(
      collection(db, 'reviews', String(productId), 'entries'),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id:       d.id,
        ...d.data(),
        date: d.data().createdAt?.toDate
          ? d.data().createdAt.toDate().toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
          : '',
      }));
      setReviews(data);
      setLoading(false);
    });

    return unsub;
  }, [productId]);

  // ── Derived values ───────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Has this device purchased this product?
  const hasPurchased = purchases.includes(String(productId));

  // Has this device already reviewed this product?
  // We track this in localStorage to avoid duplicate reviews
  const getReviewedProducts = () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('dt_reviewed')) || [];
    } catch { return []; }
  };
  const hasReviewed = getReviewedProducts().includes(String(productId));

  // ── Add a review to Firestore ────────────────────────────────
  const addReview = async ({ name, rating, comment }) => {
    try {
      await addDoc(
        collection(db, 'reviews', String(productId), 'entries'),
        {
          name:      name.trim(),
          rating,
          comment:   comment.trim(),
          verified:  hasPurchased,
          createdAt: serverTimestamp(),
        },
      );

      // Mark this product as reviewed on this device
      const reviewed = getReviewedProducts();
      const updated  = [...new Set([...reviewed, String(productId)])];
      localStorage.setItem('dt_reviewed', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  // ── Mark product as purchased (device-local) ─────────────────
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
    loading,
    addReview,
    markPurchased,
  };
};

// ── Standalone helper — call in OrderConfirmation after payment ───
export const markAllPurchased = (cartItems) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('dt_purchases')) || [];
    const ids      = cartItems.map((i) => String(i.id));
    const updated  = [...new Set([...existing, ...ids])];
    localStorage.setItem('dt_purchases', JSON.stringify(updated));
  } catch {
    console.error('Failed to mark purchases');
  }
};

'use client';
// app/order-confirmation/page.jsx

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { markAllPurchased } from '@/hooks/useReviews';

const DELIVERY_STEPS = [
  { id: 'placed',    label: 'Order Placed',      icon: '📋', desc: 'Your order has been received'        },
  { id: 'paid',      label: 'Payment Confirmed',  icon: '💳', desc: 'Payment verified via Paystack'       },
  { id: 'preparing', label: 'Being Prepared',     icon: '👨‍🍳', desc: 'Our chefs are preparing your meal' },
  { id: 'delivery',  label: 'Out for Delivery',   icon: '🛵', desc: 'Your order is on its way'           },
  { id: 'delivered', label: 'Delivered',          icon: '✅', desc: 'Enjoy your meal!'                   },
];

const STEP_INDEX = {
  placed: 1, paid: 2, preparing: 3, delivery: 4, delivered: 5,
};

// ── Helper: get or create a stable order number ──────────────────
function getOrCreateOrderNumber() {
  const STORAGE_KEY = 'dt_current_order_number';

  if (typeof window === 'undefined') {
    return 'DT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const fresh = 'DT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  localStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}

export default function OrderConfirmation() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [orderNumber] = useState(() => getOrCreateOrderNumber());
  const [currentStatus, setCurrentStatus] = useState('paid');
  const [orderSaved, setOrderSaved]       = useState(false);
  const [savedItems]  = useState(cartItems);
  const [savedTotal]  = useState(cartTotal);

  const estimatedTime = useMemo(() =>
    new Date(Date.now() + 30 * 60000).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit',
    }), []
  );

  // ── 1. Save order — waits for user to load so uid is never null ──
  useEffect(() => {
    if (orderSaved || savedItems.length === 0) return;

    // Wait until auth is resolved (user can be null for guests, that's fine)
    // But if user is undefined it means auth hasn't loaded yet — wait
    if (user === undefined) return;

    const saveOrder = async () => {
      try {
        await setDoc(doc(db, 'orders', orderNumber), {
          orderId:       orderNumber,
          customerName:  user?.displayName || user?.name || 'Guest',
          customerEmail: user?.email || '',
          customerPhone: user?.phone || '',
          uid:           user?.uid || null,   // ✅ now always captures uid if logged in
          items: savedItems.map((item) => ({
            id:              item.id,
            name:            item.name,
            qty:             item.qty || 1,
            price:           item.price,
            total:           item.total,
            selectedVariant: item.selectedVariant || null,
            image:           item.image || null,
          })),
          total:     savedTotal,
          status:    'paid',
          createdAt: serverTimestamp(),
        });
        setOrderSaved(true);
        markAllPurchased(savedItems);
        clearCart();
      } catch (err) {
        console.error('Failed to save order:', err);
      }
    };

    saveOrder();
  }, [user]); // ✅ re-runs when user loads, ensuring uid is captured

  // ── 2. Listen for real-time status updates from admin ───────
  useEffect(() => {
    if (!orderNumber) return;
    const unsub = onSnapshot(doc(db, 'orders', orderNumber), (snap) => {
      if (snap.exists()) {
        const status = snap.data().status;
        if (status) setCurrentStatus(status);

        if (status === 'delivered') {
          localStorage.removeItem('dt_current_order_number');
        }
      }
    });
    return unsub;
  }, [orderNumber]);

  const currentStepIndex = STEP_INDEX[currentStatus] || 2;
  const progress = Math.round(((currentStepIndex - 1) / (DELIVERY_STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Celebration Header ── */}
        <div className="bg-orange-500 rounded-3xl p-8 text-center text-white
                        shadow-xl shadow-orange-500/30">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-black mb-1">Order Confirmed!</h1>
          <p className="text-orange-100 text-sm mb-4">
            Thank you for ordering from Dynamic Tower Multipurpose LTD
          </p>
          <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30
                           text-white text-xs font-black px-5 py-2 rounded-full tracking-widest">
            Order #{orderNumber}
          </span>
        </div>

        {/* ── Live Delivery Tracker ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6
                        border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-gray-900 dark:text-white text-lg">
              Live Delivery Tracking
            </h2>
            <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-500
                             border border-orange-200 dark:border-orange-700
                             px-3 py-1 rounded-full font-bold">
              ETA: {estimatedTime}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right font-medium">
              {progress}% complete
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-0">
            {DELIVERY_STEPS.map((step, index) => {
              const stepIdx     = STEP_INDEX[step.id];
              const isCompleted = stepIdx < currentStepIndex;
              const isActive    = stepIdx === currentStepIndex;
              const isPending   = stepIdx > currentStepIndex;

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                    text-lg shrink-0 transition-all duration-500
                      ${isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-800'
                        : 'bg-gray-100 dark:bg-gray-700 opacity-40'}`}>
                      {step.icon}
                    </div>
                    {index < DELIVERY_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 transition-all duration-500
                        ${isCompleted ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-black text-sm transition-all flex items-center gap-2
                      ${isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : isActive
                        ? 'text-orange-500'
                        : 'text-gray-400'}`}>
                      {isCompleted && '✓ '}{step.label}
                      {isActive && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full
                                         bg-orange-500 animate-pulse" />
                      )}
                    </p>
                    <p className={`text-xs mt-0.5
                      ${isPending ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-gray-400">
              This page updates live as admin changes your order status
            </p>
          </div>
        </div>

        {/* ── Order Summary ── */}
        {savedItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6
                          border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="font-black text-gray-900 dark:text-white text-lg mb-4">
              Order Summary
            </h2>
            <div className="flex flex-col gap-0">
              {savedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3
                                        border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {item.image && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0
                                    border border-gray-100 dark:border-gray-700">
                      <Image src={item.image} alt={item.name} fill
                        className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    {item.selectedVariant && (
                      <p className="text-xs text-gray-400">{item.selectedVariant}</p>
                    )}
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-black text-orange-500 shrink-0">
                    ₦{item.total?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Delivery fee</span>
                <span className="text-green-500 font-semibold">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-900 dark:text-white">Total Paid</span>
                <span className="font-black text-xl text-orange-500">
                  ₦{savedTotal?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/product')}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white
                       py-4 rounded-xl font-black text-sm transition-all
                       shadow-lg shadow-orange-500/25">
            Order More Food 🍔
          </button>
          <button onClick={() => router.push('/')}
            className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                       text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700
                       py-4 rounded-xl font-black text-sm transition-all">
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

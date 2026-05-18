'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FOOD_ITEMS } from '@/data/FoodData';
import { useCart } from '@/hooks/useCart';
import ReviewSection from '@/components/ReviewSection';

// ── Share Buttons Component ──────────────────────────────────────
function ShareButtons({ product }) {
  const [copied, setCopied] = useState(false);

  const url     = typeof window !== 'undefined'
    ? window.location.href
    : `https://dynamic-tower.vercel.app/product/${product.id}`;
  const text    = `🍽️ Check out ${product.name} on Dynamic Tower Foods!\nOrder now 👉 ${url}`;
  const encoded = encodeURIComponent(text);
  const urlOnly = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shares = [
    {
      label:   'WhatsApp',
      icon:    '📱',
      color:   'bg-green-500 hover:bg-green-600',
      action:  () => window.open(`https://wa.me/?text=${encoded}`, '_blank'),
    },
    {
      label:   'Facebook',
      icon:    '📘',
      color:   'bg-blue-600 hover:bg-blue-700',
      action:  () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlOnly}`, '_blank'),
    },
    {
      label:   'Twitter',
      icon:    '🐦',
      color:   'bg-sky-500 hover:bg-sky-600',
      action:  () => window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank'),
    },
    {
      label:   copied ? 'Copied!' : 'Copy Link',
      icon:    copied ? '✅' : '🔗',
      color:   copied ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-700',
      action:  handleCopy,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                    border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
        Share this meal 🚀
      </p>
      <div className="grid grid-cols-4 gap-2">
        {shares.map((s) => (
          <button
            key={s.label}
            onClick={s.action}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2
                        rounded-2xl text-white transition-all active:scale-95 ${s.color}`}
          >
            <span className="text-xl leading-none">{s.icon}</span>
            <span className="text-[9px] font-bold tracking-wide">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetails({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity]         = useState(1);
  const [addedFlash, setAddedFlash]     = useState(false);

  // ── Fetch from Firestore first, fallback to FoodData ────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', String(id)));
        if (snap.exists()) {
          const data = { ...snap.data(), id: snap.data().id || snap.id };
          setProduct(data);
          setSelectedVariant(data.variants?.[0] || {});
        } else {
          // Fallback to local FoodData
          const local = FOOD_ITEMS.find((item) => item.id === parseInt(id));
          setProduct(local || null);
          setSelectedVariant(local?.variants?.[0] || {});
        }
      } catch (err) {
        // Network error — fallback to local
        const local = FOOD_ITEMS.find((item) => item.id === parseInt(id));
        setProduct(local || null);
        setSelectedVariant(local?.variants?.[0] || {});
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-white dark:bg-gray-950 text-center px-4">
      <span className="text-5xl mb-4">🍽️</span>
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Product not found</h2>
      <button onClick={() => router.push('/product')}
        className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold
                   hover:bg-orange-600 transition-all">
        Back to Menu
      </button>
    </div>
  );

  const handleAddToCart = () => {
    addToCart({
      ...product,
      qty:             quantity,
      selectedVariant: selectedVariant?.label || null,
      price:           selectedVariant?.price || product.price,
      total:           (selectedVariant?.price || product.price) * quantity,
      image:           selectedVariant?.image || product.image,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      qty:             quantity,
      selectedVariant: selectedVariant?.label || null,
      price:           selectedVariant?.price || product.price,
      total:           (selectedVariant?.price || product.price) * quantity,
      image:           selectedVariant?.image || product.image,
    });
    router.push('/delivery-address');
  };

  const total = (selectedVariant?.price || product.price || 0) * quantity;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 px-4">
      <div className="max-w-md mx-auto flex flex-col gap-4">

        {/* Back */}
        <button onClick={() => router.push('/product')}
          className="flex items-center gap-1 text-orange-500 font-semibold text-sm w-fit
                     hover:text-orange-600 transition-colors">
          ← Back to Menu
        </button>

        {/* Image */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800
                        border border-gray-100 dark:border-gray-700 shadow-sm">
          <img
            src={selectedVariant?.image || product.image}
            alt={product.name}
            className="w-full h-72 object-cover transition-all duration-500"
          />
          <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px]
                           font-black uppercase px-3 py-1 rounded-full shadow-md">
            {selectedVariant?.label || 'New'}
          </span>
          <span className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90
                           text-orange-500 border border-orange-200 dark:border-orange-700
                           text-[10px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-sm">
            ⭐ Popular
          </span>
        </div>

        {/* Title & Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                        border border-gray-100 dark:border-gray-700 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{product.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {product.description || "Freshly made — a classic choice for all ages."}
          </p>
        </div>

        {/* Share Buttons */}
        <ShareButtons product={product} />

        {/* Variant Selection */}
        {product.variants?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                          border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Choose Size
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2
                              transition-all duration-200 active:scale-95
                    ${selectedVariant?.label === variant.label
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-orange-200'
                    }`}
                >
                  <span className={`text-sm font-black
                    ${selectedVariant?.label === variant.label
                      ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {variant.label}
                  </span>
                  <span className="text-[10px] text-gray-400 my-0.5">{variant.weight}</span>
                  <span className="text-sm font-black text-orange-500">
                    ₦{Number(variant.price)?.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Row */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                        border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                Total
              </span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ₦{total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-1 py-1 gap-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-white dark:hover:bg-gray-600 transition-colors
                           text-gray-600 dark:text-gray-300 font-bold text-lg">−</button>
              <span className="w-8 text-center font-black text-gray-900 dark:text-white text-sm">
                {quantity}
              </span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           hover:bg-white dark:hover:bg-gray-600 transition-colors
                           text-gray-600 dark:text-gray-300 font-bold text-lg">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart}
              className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95
                ${addedFlash
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 hover:bg-orange-100'
                }`}>
              {addedFlash ? '✓ Added!' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-95
                         text-white py-3.5 rounded-xl font-black text-sm
                         transition-all shadow-lg shadow-orange-500/25">
              Buy Now
            </button>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}

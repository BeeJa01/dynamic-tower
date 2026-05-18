'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FOOD_ITEMS } from '@/data/FoodData';
import { useCart } from '@/hooks/useCart';
import ReviewSection from '@/components/ReviewSection';

// ── Related Products Component ───────────────────────────────────
function RelatedProducts({ currentProduct }) {
  const router = useRouter();

  const related = FOOD_ITEMS.filter(
    (item) => item.category === currentProduct.category && item.id !== currentProduct.id
  ).slice(0, 6);

  if (related.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                    border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
        You might also like 🍽️
      </p>

      <div className="flex flex-col gap-3">
        {related.map((item) => {
          const displayPrice = item.cakeVariantType === 'matrix'
            ? item.cakePrices[item.cakeLayers[0].key][item.cakeSizes[0]]
            : (item.variants?.[0]?.price || item.price);

          return (
            <button
              key={item.id}
              onClick={() => router.push(`/product/${item.id}`)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-900
                         hover:border-orange-200 dark:hover:border-orange-700
                         active:scale-[0.98] transition-all duration-200 text-left w-full"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
                <img
                  src={item.variants?.[0]?.image || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 dark:text-white
                               leading-tight truncate mb-1">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate mb-1.5">
                  {item.description?.slice(0, 55)}…
                </p>
                <span className="text-sm font-black text-orange-500">
                  from ₦{Number(displayPrice)?.toLocaleString()}
                </span>
              </div>

              {/* Arrow */}
              <span className="text-orange-400 text-lg shrink-0">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
      label:  'WhatsApp',
      icon:   '📱',
      color:  'bg-green-500 hover:bg-green-600',
      action: () => window.open(`https://wa.me/?text=${encoded}`, '_blank'),
    },
    {
      label:  'Facebook',
      icon:   '📘',
      color:  'bg-blue-600 hover:bg-blue-700',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlOnly}`, '_blank'),
    },
    {
      label:  'Twitter',
      icon:   '🐦',
      color:  'bg-sky-500 hover:bg-sky-600',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank'),
    },
    {
      label:  copied ? 'Copied!' : 'Copy Link',
      icon:   copied ? '✅' : '🔗',
      color:  copied ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-700',
      action: handleCopy,
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

// ── Hybrid Variant Selector (≤4 = cards, ≥5 = pills) ────────────
function HybridVariantSelector({ variants, selectedVariant, onSelect }) {
  const useCards = variants.length <= 4;

  if (useCards) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                      border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          Choose Variant
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {variants.map((variant, index) => {
            const isSelected = selectedVariant?.label === variant.label;
            return (
              <button
                key={index}
                onClick={() => onSelect(variant)}
                className={`flex flex-col items-start p-4 rounded-2xl border-2
                            transition-all duration-200 active:scale-95 text-left
                  ${isSelected
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-orange-200'
                  }`}
              >
                <span className={`text-sm font-black leading-tight mb-1
                  ${isSelected ? 'text-orange-500' : 'text-gray-800 dark:text-gray-200'}`}>
                  {variant.label}
                </span>
                {variant.weight && (
                  <span className="text-[10px] text-gray-400 mb-2">{variant.weight}</span>
                )}
                <span className={`text-base font-black
                  ${isSelected ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  ₦{Number(variant.price)?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Pills layout for 5+ variants
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                    border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
        Choose Variant
      </h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant, index) => {
          const isSelected = selectedVariant?.label === variant.label;
          return (
            <button
              key={index}
              onClick={() => onSelect(variant)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-full border-2
                          transition-all duration-200 active:scale-95
                ${isSelected
                  ? 'border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                }`}
            >
              <span className="text-xs font-black">{variant.label}</span>
              {variant.weight && (
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                  {variant.weight}
                </span>
              )}
              <span className={`text-xs font-black mt-0.5 ${isSelected ? 'text-white' : 'text-orange-500'}`}>
                ₦{Number(variant.price)?.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Cake 2-Step Selector ─────────────────────────────────────────
function CakeVariantSelector({ product, onPriceChange }) {
  const [selectedLayer, setSelectedLayer] = useState(product.cakeLayers[0]);
  const [selectedSize, setSelectedSize]   = useState(product.cakeSizes[0]);

  const currentPrice = product.cakePrices[selectedLayer.key]?.[selectedSize] || 0;

  useEffect(() => {
    onPriceChange(currentPrice, `${selectedLayer.label} — ${selectedSize}`);
  }, [selectedLayer, selectedSize]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5
                    border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5">

      {/* Step 1 — Layers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black
                           flex items-center justify-center shrink-0">1</span>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Choose Layers
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {product.cakeLayers.map((layer) => {
            const isSelected = selectedLayer.key === layer.key;
            return (
              <button
                key={layer.key}
                onClick={() => setSelectedLayer(layer)}
                className={`py-3 px-4 rounded-xl border-2 font-black text-sm
                            transition-all duration-200 active:scale-95
                  ${isSelected
                    ? 'border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                  }`}
              >
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 dark:bg-gray-700" />

      {/* Step 2 — Size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black
                           flex items-center justify-center shrink-0">2</span>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Choose Size
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {product.cakeSizes.map((size) => {
            const isSelected = selectedSize === size;
            const price = product.cakePrices[selectedLayer.key]?.[size];
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex flex-col items-center px-4 py-2.5 rounded-full border-2
                            transition-all duration-200 active:scale-95
                  ${isSelected
                    ? 'border-orange-400 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                  }`}
              >
                <span className="text-sm font-black">{size}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-orange-100' : 'text-orange-500'}`}>
                  ₦{Number(price)?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live price preview */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl px-4 py-3
                      border border-orange-100 dark:border-orange-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">
            Selected
          </span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {selectedLayer.label} — {selectedSize}
          </span>
        </div>
        <span className="text-xl font-black text-orange-500">
          ₦{currentPrice.toLocaleString()}
        </span>
      </div>

      {/* Notes */}
      <p className="text-[10px] text-gray-400 leading-relaxed">
        🎂 Vanilla, strawberry or red velvet as standard. Other flavours (chocolate, fruit cake, etc.) attract extra cost.
        Fondant & buttercream icing extra. Delivery, design complexity & rush orders extra.
      </p>
    </div>
  );
}

// ── Main ProductDetails Page ─────────────────────────────────────
export default function ProductDetails({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity]       = useState(1);
  const [addedFlash, setAddedFlash]   = useState(false);

  // For cake matrix — overrides selectedVariant price/label
  const [cakePrice, setCakePrice]     = useState(0);
  const [cakeLabel, setCakeLabel]     = useState('');

  // ── Fetch from Firestore, fallback to FoodData ──────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', String(id)));
        if (snap.exists()) {
          const data = { ...snap.data(), id: snap.data().id || snap.id };
          setProduct(data);
          setSelectedVariant(data.variants?.[0] || {});
        } else {
          const local = FOOD_ITEMS.find((item) => item.id === parseInt(id));
          setProduct(local || null);
          setSelectedVariant(local?.variants?.[0] || {});
          // Init cake price
          if (local?.cakeVariantType === 'matrix') {
            const firstLayer = local.cakeLayers[0];
            const firstSize  = local.cakeSizes[0];
            setCakePrice(local.cakePrices[firstLayer.key][firstSize]);
            setCakeLabel(`${firstLayer.label} — ${firstSize}`);
          }
        }
      } catch {
        const local = FOOD_ITEMS.find((item) => item.id === parseInt(id));
        setProduct(local || null);
        setSelectedVariant(local?.variants?.[0] || {});
        if (local?.cakeVariantType === 'matrix') {
          const firstLayer = local.cakeLayers[0];
          const firstSize  = local.cakeSizes[0];
          setCakePrice(local.cakePrices[firstLayer.key][firstSize]);
          setCakeLabel(`${firstLayer.label} — ${firstSize}`);
        }
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

  const isCakeMatrix = product.cakeVariantType === 'matrix';

  // Resolve the effective price and label depending on product type
  const effectivePrice = isCakeMatrix
    ? cakePrice
    : (selectedVariant?.price || product.price || 0);

  const effectiveLabel = isCakeMatrix
    ? cakeLabel
    : (selectedVariant?.label || 'New');

  const effectiveImage = isCakeMatrix
    ? product.image
    : (selectedVariant?.image || product.image);

  const total = effectivePrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      qty:             quantity,
      selectedVariant: effectiveLabel,
      price:           effectivePrice,
      total:           total,
      image:           effectiveImage,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      qty:             quantity,
      selectedVariant: effectiveLabel,
      price:           effectivePrice,
      total:           total,
      image:           effectiveImage,
    });
    router.push('/delivery-address');
  };

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
            src={effectiveImage}
            alt={product.name}
            className="w-full h-72 object-cover transition-all duration-500"
          />
          <span className="absolute top-4 left-4 bg-orange-500 text-white text-[10px]
                           font-black uppercase px-3 py-1 rounded-full shadow-md">
            {effectiveLabel}
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

        {/* ── Variant Selector — cake gets 2-step, others get hybrid ── */}
        {isCakeMatrix ? (
          <CakeVariantSelector
            product={product}
            onPriceChange={(price, label) => {
              setCakePrice(price);
              setCakeLabel(label);
            }}
          />
        ) : (
          product.variants?.length > 0 && (
            <HybridVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )
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

        {/* Related Products */}
        <RelatedProducts currentProduct={product} />

      </div>
    </div>
  );
}

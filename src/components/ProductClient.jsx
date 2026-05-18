'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FOOD_ITEMS } from "@/data/FoodData";
import StarRating from "@/components/StarRating";
import { useReviews } from "@/hooks/useReviews";


const categories = ["All", "Swallow", "Snacks", "Rice", "Pepper Soup", "Breakfast Meals", "Noodles", "Pasta"];

const FoodCardRating = ({ productId }) => {
  const { avgRating, reviewCount } = useReviews(productId);
  if (!avgRating) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      <StarRating rating={Number(avgRating)} size="sm" />
      <span className="text-xs text-gray-400">({reviewCount})</span>
    </div>
  );
};

export default function ProductClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems]     = useState(FOOD_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      // Get all Firestore products
      const firestoreProducts = snap.docs.map((d) => ({ ...d.data(), id: d.data().id || d.id }));

      // IDs of hardcoded products (1–20)
      const hardcodedIds = new Set(FOOD_ITEMS.map((p) => String(p.id)));

      // Only keep Firestore products that are NOT already in FOOD_ITEMS
      const newOnly = firestoreProducts.filter((p) => !hardcodedIds.has(String(p.id)));

      // Merge: hardcoded 20 first, then any newly added ones from admin
      const merged = [...FOOD_ITEMS, ...newOnly];
      merged.sort((a, b) => Number(a.id) - Number(b.id));

      setItems(merged);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredItems = items.filter((item) =>
    activeCategory === "All" || item.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">
            Fresh & Ready
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Place Your Order Now!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {loading ? 'Loading menu...' : `${filteredItems.length} meal${filteredItems.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                      border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeCategory === cat
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                                      dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                <div className="p-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3" />
                  <div className="h-7 bg-orange-100 dark:bg-orange-900/20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Link href={`/product/${item.id}`} key={item.id} className="group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                                dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1
                                transition-all duration-300 overflow-hidden">
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                    />
                    <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 text-orange-500
                                    font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                      ₦{item.price?.toLocaleString?.() ?? item.price}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                      {item.name}
                    </h3>
                    <FoodCardRating productId={item.id} />
                    <button className="w-full mt-3 bg-orange-500 hover:bg-orange-600 active:scale-95
                                       text-white py-2 rounded-xl font-bold text-xs transition-all
                                       shadow-sm shadow-orange-500/20">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🍽️</span>
            <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-1">No meals found</h3>
            <p className="text-gray-400 text-sm">Try a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}

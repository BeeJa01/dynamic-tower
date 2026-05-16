'use client';
// app/search/page.jsx

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FOOD_ITEMS } from '@/data/FoodData';

function SearchContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const queryFromURL  = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryFromURL);

  useEffect(() => { setSearchQuery(queryFromURL); }, [queryFromURL]);

  const filteredItems = FOOD_ITEMS.filter((item) => {
    const q = queryFromURL.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="bg-amber-50 dark:bg-gray-950 p-4 mb-8 text-center min-h-screen">

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto my-6 px-4">
        <form onSubmit={handleSearch} className="relative">
          <input type="text" placeholder="Search food, snacks and categories..."
            className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200
                       focus:outline-none focus:border-[#E87121]
                       dark:bg-gray-800 dark:border-gray-700 dark:text-white
                       dark:placeholder-gray-400 text-sm"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
          <button type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-[#E87121] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-sm mb-4 text-left px-4">
        {queryFromURL
          ? `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${queryFromURL}"`
          : `Showing all ${filteredItems.length} items`}
      </p>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Link href={`/product/${item.id}`} key={item.id} className="group">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100
                              hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
                <div className="h-48 overflow-hidden rounded-xl relative">
                  <Image src={item.image} alt={item.name} fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 20vw" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-[#E87121] font-bold mb-4">₦{item.price.toLocaleString()}</p>
                  <button className="w-full mt-4 bg-[#E87121] text-white py-2 rounded-lg font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🍽️</span>
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-400 text-sm mb-6">
              We couldn't find "{queryFromURL}" — try a different name or category.
            </p>
            <button onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white
                         px-6 py-2.5 rounded-full text-sm font-medium transition-all">
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <SearchContent />
    </Suspense>
  );
}

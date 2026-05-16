'use client';

import Link from 'next/link';
import { FOOD_ITEMS } from '@/data/FoodData';
import { ArrowRight } from '@/components/Icons';

const FeaturedMeals = () => {
  const featured = FOOD_ITEMS.slice(16, 20);

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">
              This Week`s Picks
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Our Top Picks
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Customer favorites this week in Ogbomoso
            </p>
          </div>
          <Link
            href="/product"
            className="hidden sm:flex items-center gap-1 text-orange-500 font-bold text-sm
                       hover:text-orange-600 transition-colors group"
          >
            See Full Menu
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((item, i) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100
                         dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1
                         transition-all duration-300 group overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-white dark:bg-gray-900 text-orange-500
                                font-black text-sm px-2.5 py-1 rounded-full shadow-md">
                  ₦{item.price?.toLocaleString?.() ?? item.price}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{item.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-4">
                  {item.description || "Freshly prepared with the finest ingredients."}
                </p>
                <Link
                  href={`/product/${item.id}`}
                  className="block text-center w-full bg-orange-500 hover:bg-orange-600
                             active:scale-95 text-white py-2.5 rounded-xl font-bold text-sm
                             transition-all shadow-sm shadow-orange-500/20"
                >
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile see all */}
        <div className="flex justify-center mt-8 sm:hidden">
          <Link
            href="/product"
            className="flex items-center gap-1 text-orange-500 font-bold text-sm border
                       border-orange-200 px-5 py-2.5 rounded-full hover:bg-orange-50 transition-colors"
          >
            See Full Menu <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMeals;

'use client';

import React from "react";
import Link from "next/link";

const ImageList = [
  { id: 1, img: "/Food1.webp" },
  { id: 2, img: "/Food2.webp" },
  { id: 3, img: "/Food3.webp" },
];

const bgImage = {
  backgroundImage: `url(/hero.webp)`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  width: "100%",
  height: "600px",
};

const Hero = () => {
  const [imageId, setImageId] = React.useState("/Food1.webp");

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden dark:bg-gray-950">

      {/* Background */}
      <div style={bgImage} className="absolute inset-0 z-0" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-linear-to-r from-white/92 via-white/75 to-white/10
                      dark:from-gray-950/95 dark:via-gray-950/75 dark:to-transparent" />

      {/* Orange glow blob */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* LEFT: Text */}
        <div className="flex flex-col items-start text-left order-2 md:order-1">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full
                           bg-orange-500/10 border border-orange-400/30 text-orange-600
                           text-xs font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Free Delivery in Ogbomoso
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.05] mb-4">
            Crave it?<br />
            Get it{" "}
            <span className="relative inline-block text-orange-500">
              fast.
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-orange-300/50 rounded-full" />
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mb-8 leading-relaxed">
            Hot meals from your favourite spot, delivered to your door in an hour or less.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link href="/product">
              <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white
                                 px-7 py-3.5 rounded-full text-sm font-bold shadow-lg
                                 shadow-orange-500/30 transition-all">
                Order Now →
              </button>
            </Link>
            <Link href="/services">
              <button className="bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700
                                 border border-gray-200 dark:border-gray-700 text-gray-800
                                 dark:text-white px-5 py-3.5 rounded-full text-sm font-bold
                                 backdrop-blur-sm transition-all">
                Browse Services
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            {[
              { num: "100+", label: "Meals" },
              { num: "1 hr", label: "Avg Delivery" },
              { num: "4.8★", label: "Rating" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stat.num}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Image */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end items-center relative py-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-3xl scale-125" />
            <img
              src={imageId}
              alt="Featured Meal"
              className="relative w-56 md:w-80 lg:w-96 drop-shadow-2xl md:pr-10 animate-slow-spin transition-opacity duration-300"
            />
          </div>

          {/* Thumbnails */}
          <div className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {ImageList.map((item) => (
              <button
                key={item.id}
                onClick={() => setImageId(item.img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all
                            hover:scale-110 active:scale-95
                            ${imageId === item.img
                              ? 'border-orange-500 shadow-lg shadow-orange-500/30 scale-105'
                              : 'border-white/70 dark:border-gray-700 opacity-80'
                            }`}
              >
                <img src={item.img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce opacity-60">
        <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Scroll</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" className="text-orange-400">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;

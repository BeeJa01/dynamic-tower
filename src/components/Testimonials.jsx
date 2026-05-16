'use client';

import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: "Tunde Bakare",
    role: "LAUTECH Student",
    text: "The Jollof Rice from Dynamic Tower is unmatched. It arrived hot and the portions were great for the price!",
    stars: 5,
  },
  {
    name: "Sarah Adeyemi",
    role: "Business Owner",
    text: "I love how easy it is to order. 'Crave it? Get it fast' isn't just a slogan — they actually delivered in 20 minutes.",
    stars: 5,
  },
  {
    name: "Samuel Okafor",
    role: "Local Resident",
    text: "Best snacks in Ogbomoso. Their meatpie is always fresh. I recommend them to everyone in my neighborhood.",
    stars: 4,
  },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Header */}
        <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">
          Happy Customers
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
          What Our Customers Say
        </h2>
        <div className="w-16 h-1 bg-orange-500 mx-auto mb-12 rounded-full" />

        {/* Card */}
        <div className="relative min-h-55">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700
                ${index === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
            >
              <div className="bg-orange-50 dark:bg-gray-800 border border-orange-100
                              dark:border-gray-700 rounded-3xl p-8 max-w-xl w-full
                              shadow-sm mx-auto">
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < item.stars ? 'text-orange-400' : 'text-gray-200 dark:text-gray-600'}`}>
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6 text-base">
                    `{item.text}`
                </p>

                <div className="flex items-center justify-center gap-3">
                  <div className="w-11 h-11 bg-orange-500 rounded-full flex items-center
                                  justify-center text-white font-black text-base shadow-md">
                    {item.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-orange-500 font-semibold uppercase tracking-widest">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300
                ${currentIndex === i ? 'w-8 bg-orange-500' : 'w-2 bg-orange-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;

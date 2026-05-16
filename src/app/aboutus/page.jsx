import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">

      {/* Hero */}
      <section className="relative py-20 px-6 text-center bg-orange-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-100 mb-3 block">Who We Are</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            About <span className="text-orange-100">Us</span>
          </h1>
          <p className="text-lg text-orange-50 max-w-2xl mx-auto leading-relaxed">
            More than just a store — we are a multipurpose enterprise dedicated to quality food,
            professional catering, and community growth.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img src="/logo.webp" alt="Dynamic Tower Logo" className="h-20 w-auto mb-6 opacity-80" />
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3 block">Our Story</span>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-base">
            Founded with a vision of excellence, Dynamic Tower began as a small idea to solve a big problem:
            getting high-quality meals to busy people without the wait.
          </p>
          <div className="border-l-4 border-orange-500 pl-4 italic text-gray-700 dark:text-gray-300 text-sm">
            `Our commitment is to quality, speed, and the smiles of our customers.` 
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-xl border border-orange-100 dark:border-gray-700">
          <img src="/sticker.webp" alt="Our Kitchen" className="w-full h-80 object-cover" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Mission & Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🎯", title: "Our Mission", text: "To craft delicious, high-quality, and beautifully packaged foods using the finest ingredients, while maintaining excellent hygiene, innovation, and customer satisfaction." },
              { icon: "✨", title: "Our Vision", text: "To become a globally recognized food brand, celebrated for delivering irresistible snacks and meals that bring joy, quality, and unforgettable taste experiences." },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-5 text-3xl border border-orange-100 dark:border-orange-800">{item.icon}</div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3">{item.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event CTA */}
      <section className="max-w-4xl mx-auto mb-16 px-6">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-dashed border-orange-300 dark:border-orange-700 p-10 text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Planning a special event?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed text-sm">
            Whether it is a small family gathering or a big celebration, we`d love to help you create a menu your guests will talk about for weeks.
          </p>
          <Link href="/services" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 text-sm">
            Let us plan your menu →
          </Link>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="py-16 text-center bg-gray-950 dark:bg-black px-6">
        <h2 className="text-2xl font-black text-white mb-2">Ready to taste the difference?</h2>
        <p className="text-gray-400 text-sm mb-8">Order fresh meals delivered right to your door.</p>
        <Link href="/product" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-all active:scale-95 inline-block">
          Explore Our Menu →
        </Link>
      </section>
    </div>
  );
}

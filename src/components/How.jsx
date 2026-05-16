'use client';

const HowItWorks = () => {
  const steps = [
    {
      title: "Pick Your Meal",
      desc: "Browse our wide variety of freshly prepared dishes and choose your favourites.",
      icon: "🍱",
      step: "01",
    },
    {
      title: "Fast Cooking",
      desc: "Our expert chefs start preparing your order the moment it comes in.",
      icon: "👨‍🍳",
      step: "02",
    },
    {
      title: "Quick Delivery",
      desc: "Hot, fresh food delivered straight to your door in record time.",
      icon: "🛵",
      step: "03",
    },
  ];

  return (
    <section className="py-16 bg-orange-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">
            Simple & Fast
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px
                          bg-linear-to-r from-transparent via-orange-200 dark:via-orange-800 to-transparent z-0" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center
                         bg-white dark:bg-gray-800 rounded-2xl p-8
                         border border-gray-100 dark:border-gray-700
                         shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 text-xs font-black text-orange-200
                               dark:text-orange-900 tracking-widest">
                {step.step}
              </span>

              {/* Icon */}
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-2xl
                              flex items-center justify-center text-4xl mb-5
                              group-hover:scale-110 transition-transform duration-300
                              shadow-sm border border-orange-100 dark:border-orange-800">
                {step.icon}
              </div>

              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

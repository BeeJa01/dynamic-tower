import Link from "next/link";
import { ArrowRight } from '@/components/Icons';

const Services = () => {
  const services = [
    { id: 1, slug: 'induction',     title: "Induction Service",      description: "Our special induction package features plates of spicy, smoky Jollof Rice.",                                          price: "View Pricing", image: "/Jollofrice.webp",      badge: "Best Seller" },
    { id: 2, slug: 'birthday',      title: "Birthday Party",          description: "Make your special day unforgettable with our custom birthday catering menus.",                                         price: "View Pricing", image: "/birthdayy.webp" },
    { id: 3, slug: 'personal-chef', title: "Personal Chef",           description: "A private culinary experience in the comfort of your home, tailored to your taste.",                                   price: "Monthly",      image: "/pancake.webp" },
    { id: 4, slug: 'corporate',     title: "Nutrition Consultation",  description: "We partner with you to create personalized meal plans that fuel your body and soul.",                                  price: "Per Session",  image: "/consultation.webp" },
  ];

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-2 block">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Our <span className="text-orange-500">Services</span>
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            From small gatherings to large celebrations, we provide premium catering
            services tailored to your needs.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                         overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Image */}
              <div className="h-44 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {service.badge && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white
                                  text-[10px] font-black px-2.5 py-1 rounded-full shadow-md
                                  uppercase tracking-wide">
                    {service.badge}
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-1.5">
                  {service.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-500">{service.price}</span>
                  <Link href={`/booking/${service.slug}`}>
                    <button className="text-xs font-bold text-gray-900 dark:text-white
                                       bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-500
                                       hover:text-white px-3 py-1.5 rounded-full
                                       transition-all border border-orange-200 dark:border-orange-800">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Link
        href="/services"
        className="hidden sm:flex items-center gap-1 px-4 py-2 text-orange-500 font-bold text-sm
                   hover:text-orange-600 transition-colors group"
      >
        See Full Services
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
};

export default Services;

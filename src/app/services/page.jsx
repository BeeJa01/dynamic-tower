// app/Services/page.jsx  — no 'use client' needed (no interactivity)

import Link from 'next/link';
import Image from 'next/image';

const services = [
  { id: 1, slug: 'induction',     title: "Induction Service",     description: "Our special induction package features plates of spicy, smoky Jollof Rice.",                                        price: "View Pricing", image: "/Jollofrice.webp",    badge: "Best Seller" },
  { id: 2, slug: 'birthday',      title: "Birthday Party",         description: "Make your special day unforgettable with our custom birthday catering menus.",                                       price: "View Pricing", image: "/birthday.webp" },
  { id: 3, slug: 'personal-chef', title: "Personal Chef",          description: "A private culinary experience in the comfort of your home, tailored to your taste.",                                 price: "Monthly",      image: "/pancake.webp" },
  { id: 4, slug: 'corporate',     title: "Nutrition Consultation", description: "We partner with you to create personalized meal plans that fuel your body and soul.",                                price: "Per Session",  image: "/consultation.webp" },
  { id: 5, slug: 'wedding',       title: "Wedding Ceremony",       description: "We craft delicious menus and beautiful moments so you can focus entirely on your 'I do'.",                          price: "View Pricing", image: "/wedding.webp" },
  { id: 6, slug: 'convocation',   title: "Convocation Program",    description: "Celebrate your years of hard work with a joyful feast shared among family and friends.",                            price: "View Pricing", image: "/convocation.webp" },
  { id: 7, slug: 'anniversaries', title: "Anniversary",            description: "Relive your favourite memories over an intimate, flavorful meal designed to honor your beautiful journey.",         price: "View Pricing", image: "/anniversary.webp" },
  { id: 8, slug: 'retirements',   title: "Retirements",            description: "Toast to your legacy and new adventures with a celebration as remarkable as your career.",                          price: "View Pricing", image: "/retirement.webp" },
];

export default function Services() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
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
            From small gatherings to large celebrations, we provide premium catering services tailored to your needs.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => (
            <div key={service.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                         overflow-hidden border border-gray-100 dark:border-gray-700">
              {/* Image */}
              <div className="h-44 overflow-hidden relative">
                <Image src={service.image} alt={service.title} fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                {service.badge && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white
                                  text-[10px] font-black px-2.5 py-1 rounded-full shadow-md
                                  uppercase tracking-wide z-10">
                    {service.badge}
                  </div>
                )}
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
    </section>
  );
}

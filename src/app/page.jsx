'use client';

import Hero from "@/components/Hero";
import FeaturedMeals from "@/components/FeaturedMeals";
import Services from "@/components/Services";
import HowItWorks from "@/components/How";
import TestimonialCarousel from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Hero />
      <FeaturedMeals />
      <HowItWorks />
      <Services />
      <TestimonialCarousel />
    </div>
  );
}

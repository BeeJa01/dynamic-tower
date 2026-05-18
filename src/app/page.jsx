'use client';

import Hero from "@/components/Hero";
import FeaturedMeals from "@/components/FeaturedMeals";
import Services from "@/components/Services";
import HowItWorks from "@/components/How";
import TestimonialCarousel from "@/components/Testimonials";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title:       'Dynamic Tower Multipurpose LTD — Order Fresh Food Online',
  description:
    'Order the best Nigerian food in Ogbomoso, Oyo State. ' +
    'Jollof rice, amala & abula, pepper soup, crunchy chin-chin, cake and more. ' +
    'Fast delivery from Dynamic Tower Multipurpose LTD.',
  path: '/',
});

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

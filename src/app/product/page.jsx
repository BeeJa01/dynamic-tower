import ProductClient from "@/components/ProductClient";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title:       'Our Menu — Nigerian Food, Snacks & More',
  description:
    'Browse the full Dynamic Tower menu. Jollof rice, fried rice, Chinese rice, ' +
    'pounded yam, amala, semo, eba, fufu, egusi soup, pepper soup, pasta, noodles, ' +
    'chin-chin, meatpie, puff puff, buns, doughnut, sharwarma, cake and breakfast meals — ' +
    'all available for delivery in Ogbomoso.',
  path: '/product',
});

export default function ProductCard() {
  return <ProductClient />;
}
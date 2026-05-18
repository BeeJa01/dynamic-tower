// app/sitemap.js
// Next.js App Router auto-generates /sitemap.xml from this file.
// No extra package needed.

import { FOOD_ITEMS } from '@/data/FoodData';

export default function sitemap() {
  const BASE = 'https://dynamic-tower.vercel.app';
  const now  = new Date();

  // ── Static pages ─────────────────────────────────────────────
  const staticPages = [
    {
      url:             BASE,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${BASE}/product`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${BASE}/profile`,
      lastModified:    now,
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    {
      url:             `${BASE}/order-confirmation`,
      lastModified:    now,
      changeFrequency: 'yearly',
      priority:        0.3,
    },
    // Admin is intentionally excluded from sitemap
  ];

  // ── Individual product pages ──────────────────────────────────
  const productPages = FOOD_ITEMS.map((item) => ({
    url:             `${BASE}/product/${item.id}`,
    lastModified:    now,
    changeFrequency: 'weekly',
    priority:        0.8,
  }));

  return [...staticPages, ...productPages];
}

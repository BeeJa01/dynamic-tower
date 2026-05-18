// app/sitemap.js
// Next.js App Router auto-generates /sitemap.xml from this file.
// No extra package needed.

export default function sitemap() {
  const BASE = 'https://dynamic-tower.vercel.app';
  const now  = new Date();

  return [
    {
      url:              BASE,
      lastModified:     now,
      changeFrequency: 'weekly',
      priority:         1.0,
    },
    {
      url:              `${BASE}/product`,
      lastModified:     now,
      changeFrequency: 'weekly',
      priority:         0.9,
    },
    {
      url:              `${BASE}/profile`,
      lastModified:     now,
      changeFrequency: 'monthly',
      priority:         0.5,
    },
    {
      url:              `${BASE}/order-confirmation`,
      lastModified:     now,
      changeFrequency: 'yearly',
      priority:         0.3,
    },
    // Admin is intentionally excluded from sitemap
  ];
}

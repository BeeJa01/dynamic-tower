// app/robots.js
// Next.js App Router generates /robots.txt from this file.

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://dynamic-tower.vercel.app/sitemap.xml',
  };
}

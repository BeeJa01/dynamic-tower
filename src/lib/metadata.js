// lib/metadata.js
// ─────────────────────────────────────────────────────────────────
// Central SEO config for Dynamic Tower Multipurpose LTD
// Usage: import { baseMetadata, generatePageMetadata } from '@/lib/metadata'
// ─────────────────────────────────────────────────────────────────

const SITE_URL  = 'https://dynamic-tower.vercel.app';
const SITE_NAME = 'Dynamic Tower Multipurpose LTD';
const TWITTER   = '@dynamictower';   // update if you have one

// ── All food keywords extracted from FoodData ────────────────────
const FOOD_KEYWORDS = [
  // Brand
  'Dynamic Tower Foods', 'Dynamic Tower', 'Dynamic Tower Ogbomoso',
  'Dynamic Tower Multipurpose LTD', 'food delivery Ogbomoso',
  'online food order Ogbomoso', 'restaurant Ogbomoso', 'Oyo State food delivery',

  // Rice
  'Jollof rice Ogbomoso', 'fried rice Ogbomoso', 'Chinese rice Ogbomoso',
  'jollof and chicken', 'party jollof rice',

  // Swallow
  'swallow Ogbomoso', 'pounded yam Ogbomoso', 'amala and abula',
  'semo and egusi', 'eba and egusi', 'fufu and egusi',
  'efo riro', 'egusi soup', 'pounded yam and vegetable soup',

  // Pepper soup
  'goat meat pepper soup', 'catfish pepper soup', 'pepper soup Ogbomoso',

  // Snacks
  'crunchy chin chin', 'chinchin Ogbomoso', 'meatpie Ogbomoso',
  'puff puff Ogbomoso', 'buns Ogbomoso', 'doughnut Ogbomoso',
  'sharwarma Ogbomoso', 'cake Ogbomoso', 'birthday cake Ogbomoso',
  'snacks delivery Ogbomoso',

  // Noodles & pasta
  'Singapore noodles Ogbomoso', 'pasta Ogbomoso', 'noodles delivery',

  // Breakfast
  'breakfast Ogbomoso', 'pancake egg hotdog tea',
  'bread tea and egg Ogbomoso', 'breakfast delivery Ogbomoso',
];

// ── Base metadata (used in root layout.jsx) ──────────────────────
export const baseMetadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Dynamic Tower Multipurpose LTD — Order Fresh Food Online',
    template: '%s | Dynamic Tower Foods',
  },

  description:
    'Order delicious Nigerian food online in Ogbomoso, Oyo State. ' +
    'From jollof rice, amala & abula, swallow, puff puff, crunchy chin-chin, ' +
    'cake and more — fresh, fast delivery from Dynamic Tower Multipurpose LTD.',

  keywords: FOOD_KEYWORDS,

  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Open Graph ────────────────────────────────────────────────
  openGraph: {
    type:        'website',
    locale:      'en_NG',
    url:         SITE_URL,
    siteName:    SITE_NAME,
    title:       'Dynamic Tower Multipurpose LTD — Order Fresh Food Online',
    description:
      'Fresh Nigerian food delivered to your door in Ogbomoso. ' +
      'Jollof rice, swallow, pepper soup, snacks and more. Order now!',
    images: [
      {
        url:    `${SITE_URL}/og-image.jpg`,   // create a 1200×630 image and place here
        width:  1200,
        height: 630,
        alt:    'Dynamic Tower Foods — Fresh Nigerian Food in Ogbomoso',
      },
    ],
  },

  // ── Twitter / X Card ─────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       'Dynamic Tower Multipurpose LTD — Order Fresh Food Online',
    description: 'Fresh Nigerian food delivered in Ogbomoso, Oyo State. Order jollof rice, swallow, snacks & more!',
    images:      [`${SITE_URL}/og-image.jpg`],
    // creator:  TWITTER,   // uncomment when you have a Twitter handle
  },

  // ── Robots ───────────────────────────────────────────────────
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // ── Canonical & alternates ───────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },

  // ── Icons ────────────────────────────────────────────────────
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-16x16.png',
    apple:       '/apple-touch-icon.png',
  },

  // ── Manifest ─────────────────────────────────────────────────
  manifest: `${SITE_URL}/manifest.json`,

  // ── Verification (add keys from Google/Bing Search Console) ──
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-code',
  },
};


// ─────────────────────────────────────────────────────────────────
// generatePageMetadata()
// Helper for per-page metadata — call this in each page.jsx
//
// Usage:
//   export const metadata = generatePageMetadata({
//     title:       'Menu',
//     description: 'Browse our full menu...',
//     path:        '/product',
//   });
// ─────────────────────────────────────────────────────────────────
export function generatePageMetadata({ title, description, path = '', image }) {
  const url      = `${SITE_URL}${path}`;
  const ogImage  = image || `${SITE_URL}/og-image.jpg`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: [ogImage],
    },
  };
}


export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [

      // ── 1. Local Business / Restaurant ───────────────────────
      {
        '@type':       ['Restaurant', 'FoodEstablishment', 'LocalBusiness'],
        '@id':         'https://dynamic-tower.vercel.app/#business',
        name:          'Dynamic Tower Multipurpose LTD',
        url:           'https://dynamic-tower.vercel.app',
        description:
          'Fresh Nigerian food delivery in Ogbomoso, Oyo State. ' +
          'Order jollof rice, swallow, pepper soup, snacks and more.',
        telephone:     '+2348107191319',   // 
        email:         'adekunleoluwatimilehin05@gmail.com',                
        priceRange:    '₦₦',
        currenciesAccepted: 'NGN',
        paymentAccepted:    'Cash, Online Payment',
        servesCuisine: ['Nigerian', 'West African'],
        address: {
          '@type':           'PostalAddress',
          streetAddress:     'Ogbomoso',   // ← add street if you want
          addressLocality:   'Ogbomoso',
          addressRegion:     'Oyo State',
          addressCountry:    'NG',
        },
        geo: {
          '@type':    'GeoCoordinates',
          latitude:   8.1375,    // Ogbomoso approximate coords
          longitude:  4.2417,
        },
        openingHoursSpecification: [
          {
            '@type':    'OpeningHoursSpecification',
            dayOfWeek:  ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
            opens:      '08:00',
            closes:     '22:00',
          },
        ],
        hasMap: 'https://maps.google.com/?q=Ogbomoso,Oyo+State,Nigeria',
        image: 'https://dynamic-tower.vercel.app/og-image.jpg',
        logo:  'https://dynamic-tower.vercel.app/logo.png',   // ← add your logo
        sameAs: [
          // 'https://www.facebook.com/dynamictower',   // add your social pages
          // 'https://www.instagram.com/dynamictower',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name:    'Dynamic Tower Menu',
          itemListElement: [
            // Rice
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Jollof, Fried Rice & Chicken', price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Chinese Rice',                 price: '6000', priceCurrency: 'NGN' } },
            // Swallow
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Pounded Yam & Efo Riro',      price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Amala and Abula',              price: '5000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Semo and Egusi',               price: '5000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Eba and Egusi',                price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Fufu and Egusi',               price: '3000', priceCurrency: 'NGN' } },
            // Pepper Soup
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Goat Meat Pepper Soup',        price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Catfish Pepper Soup',          price: '6000', priceCurrency: 'NGN' } },
            // Noodles & Pasta
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Singapore Noodles',            price: '7000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Pasta',                        price: '3000', priceCurrency: 'NGN' } },
            // Breakfast
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Pancake, Egg, Hotdog & Tea',   price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Bread, Tea & Egg',             price: '2500', priceCurrency: 'NGN' } },
            // Snacks
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Crunchy Chin-Chin',            price: '1500', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Meatpie',                      price: '2000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Puff-Puff',                    price: '500',  priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Buns',                         price: '500',  priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Doughnut',                     price: '500',  priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Sharwarma',                    price: '3000', priceCurrency: 'NGN' } },
            { '@type': 'Offer', itemOffered: { '@type': 'MenuItem', name: 'Cake',                         price: '10000',priceCurrency: 'NGN' } },
          ],
        },
      },

      // ── 2. Website ────────────────────────────────────────────
      {
        '@type':            'WebSite',
        '@id':              'https://dynamic-tower.vercel.app/#website',
        url:                'https://dynamic-tower.vercel.app',
        name:               'Dynamic Tower Multipurpose LTD',
        description:        'Order fresh Nigerian food online in Ogbomoso, Oyo State.',
        publisher:          { '@id': 'https://dynamic-tower.vercel.app/#business' },
        potentialAction: {
          '@type':       'SearchAction',
          target:        'https://dynamic-tower.vercel.app/product?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

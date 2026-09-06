import { CONTACT, OG_IMAGE, SITE_LOCALE, SITE_NAME, SITE_NAME_FA, SITE_URL } from './constants'

/**
 * JSON-LD structured-data builders. We expose one function per schema
 * so callers (useSEO or static <script> tags) can pick the relevant
 * block. All output is JSON-stringified and safe to embed in a
 * `<script type="application/ld+json">` tag.
 *
 * Reference: https://schema.org and https://developers.google.com/search/docs/appearance/structured-data
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME_FA,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: 'تولیدکننده تخصصی کاشی و سرامیک پرسلانی',
    sameAs: [
      'https://www.instagram.com/almasceram',
      'https://www.linkedin.com/company/almasceram',
    ], // TODO(pre-launch): replace with verified official social URLs from brand owner
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: CONTACT.email,
        telephone: CONTACT.phone,
        availableLanguage: ['Persian', 'English'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME_FA,
    alternateName: SITE_NAME,
    inLanguage: 'fa-IR',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#local-business`,
    name: SITE_NAME_FA,
    image: OG_IMAGE,
    url: SITE_URL,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.geo.latitude,
      longitude: CONTACT.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function productSchema(input: {
  name: string
  description: string
  image: string
  slug: string
  brand?: string
  sku?: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${input.slug}`,
    name: input.name,
    description: input.description,
    image: `${SITE_URL}${input.image.startsWith('/') ? '' : '/'}${input.image}`,
    category: input.category,
    sku: input.sku,
    brand: { '@type': 'Brand', name: input.brand ?? SITE_NAME_FA },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${input.slug}`,
      priceCurrency: 'IRR',
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  }
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function collectionSchema(input: { name: string; description: string; slug: string; image: string; count: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/collections/${input.slug}`,
    name: input.name,
    description: input.description,
    image: `${SITE_URL}${input.image.startsWith('/') ? '' : '/'}${input.image}`,
    url: `${SITE_URL}/collections/${input.slug}`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.count,
    },
  }
}

export function websiteAllSchemas() {
  return [organizationSchema(), websiteSchema(), localBusinessSchema()]
}

export const SITE_LANG = 'fa-IR'
export const SITE_OG_LOCALE = SITE_LOCALE

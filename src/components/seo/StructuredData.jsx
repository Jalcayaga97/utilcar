import { SITE } from '@/constants/site'

function buildLocalBusinessSchema() {
  const openingHoursSpecification = SITE.openingHours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days,
    opens: slot.opens,
    closes: slot.closes,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    image: SITE.ogImage,
    telephone: SITE.phoneTel,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressStreet,
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification,
    areaServed: {
      '@type': 'City',
      name: 'Santiago',
      containedInPlace: {
        '@type': 'Country',
        name: 'Chile',
      },
    },
    sameAs: [SITE.whatsappUrl],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phoneTel,
        contactType: 'customer service',
        areaServed: 'CL',
        availableLanguage: ['Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        url: SITE.whatsappUrl,
        areaServed: 'CL',
      },
    ],
  }
}

export function StructuredData() {
  const schema = buildLocalBusinessSchema()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

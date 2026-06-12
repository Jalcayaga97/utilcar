import { SITE } from '@/constants/site'
import { useCompanyInfo } from '@/hooks/useCms'

function buildLocalBusinessSchema(company) {
  const openingHoursSpecification = (company.openingHoursSpecification ?? SITE.openingHours).map(
    (slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    }),
  )

  const sameAs = [
    company.whatsappUrl,
    ...(company.socialLinks ?? []).map((link) => link?.url).filter(Boolean),
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    legalName: company.legalName,
    description: SITE.description,
    url: SITE.url,
    image: SITE.ogImage,
    telephone: (company.phoneTel ?? '').replace(/^tel:/, ''),
    email: company.primaryEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressStreet,
      addressLocality: company.addressLocality,
      addressRegion: company.addressRegion,
      addressCountry: company.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo?.latitude,
      longitude: company.geo?.longitude,
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
    sameAs,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: (company.phoneTel ?? '').replace(/^tel:/, ''),
        contactType: 'customer service',
        areaServed: 'CL',
        availableLanguage: ['Spanish'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        url: company.whatsappUrl,
        areaServed: 'CL',
      },
    ],
  }
}

export function StructuredData() {
  const company = useCompanyInfo()
  const schema = buildLocalBusinessSchema(company)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

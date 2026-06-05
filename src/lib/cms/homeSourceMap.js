import { USE_BLOCK_RESOLVER, USE_SPECIALTIES_V2 } from '@/lib/cms/config'

/**
 * Mapa de fuentes Home por sección (CMS / Legacy / Mixed).
 * @param {object} params
 */
export function buildHomeSourceMap({
  extensions,
  heroSection,
  servicesSection,
  specialtiesSection,
  whyUsSection,
  portfolioSection,
  sanityEnabled,
}) {
  const resolverOn = USE_BLOCK_RESOLVER && sanityEnabled

  function classify(blockKey, activeSection, extra = {}) {
    const blockFound = Boolean(extensions?.[blockKey])
    if (!resolverOn) return { source: 'Legacy', blockFound, ...extra }
    if (blockFound && activeSection) return { source: 'CMS', blockFound, ...extra }
    if (blockFound && !activeSection) return { source: 'Mixed', blockFound, ...extra }
    return { source: 'Legacy', blockFound, ...extra }
  }

  return {
    Hero: classify('heroSection', heroSection),
    Services: classify('servicesSection', servicesSection, {
      itemsCount: servicesSection?.items?.length ?? 0,
    }),
    Specialties: classify(
      'specialtiesSection',
      USE_SPECIALTIES_V2 ? specialtiesSection : null,
      { categoriesCount: specialtiesSection?.categories?.length ?? 0 },
    ),
    'Why Utilcar': classify('whyUsSection', whyUsSection, {
      itemsCount: whyUsSection?.items?.length ?? 0,
    }),
    Portfolio: classify('portfolioSection', portfolioSection, {
      featuredProjectsCount: portfolioSection?.featuredProjectIds?.length ?? 0,
    }),
    CTA: {
      source: resolverOn && extensions?.ctaBanner !== undefined ? 'CMS' : 'Mixed',
      blockFound: Boolean(extensions),
      note: 'copy from ctaBlock mirror; buttons from siteSettings.serviceCta',
    },
  }
}

import { USE_PAGE_RESOLVER, USE_SERVICES_V2 } from '@/lib/cms/config'
import {
  resolveServicePageFeatures,
  resolveServicePageGallery,
  resolveServicePageHero,
} from '@/lib/cms/assets/resolveServicePageAssets'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { getActiveFeaturesSection } from '@/lib/cms/resolvers/featuresBlockResolver'
import { getActiveServicesSection } from '@/lib/cms/resolvers/servicesResolver'
import { getActivePortfolioSection } from '@/lib/cms/resolvers/portfolioResolver'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { IMAGES } from '@/assets/images'

const PAGE_ID = 'services'

export function resolveServicesPageDocument(doc) {
  if (!doc) return { extensions: {}, warnings: [], source: 'legacy-fallback' }

  if (!USE_PAGE_RESOLVER || !USE_SERVICES_V2 || !doc.blocks?.length) {
    if (USE_SERVICES_V2 && import.meta.env.DEV) {
      warnPageLegacyFallback(PAGE_ID, { reason: 'no-blocks-or-flag-off' })
    }
    return { extensions: {}, warnings: [], source: 'legacy-fallback' }
  }

  return resolvePageFromBlocks(doc.blocks, { pageId: PAGE_ID })
}

export function getActiveServicesPageSection(extensions) {
  const section = extensions?.servicesSection
  if (!section) return null
  const items = (section.items ?? []).filter((item) => String(item?.title ?? '').trim())
  if (!items.length) return null
  return { ...section, items }
}

/**
 * Runtime display para una sub-página de servicio (talleres, ventanas, etc.).
 * CMS-first completo o legacy completo — sin mezcla parcial.
 */
export function mapServicePageRuntime(pageKey, legacyContent, extensions) {
  if (!USE_PAGE_RESOLVER || !USE_SERVICES_V2 || !extensions || !Object.keys(extensions).length) {
    return {
      content: legacyContent,
      heroImage: null,
      galleryImages: null,
      source: 'legacy',
    }
  }

  const heroSection = getActivePageSection(extensions, 'heroSection')
  const featuresSection = getActiveFeaturesSection(extensions)
  const portfolioSection = extensions?.portfolioSection

  const hasCmsContent =
    heroSection?.title ||
    featuresSection?.groups?.length ||
    portfolioSection?.items?.length

  if (!hasCmsContent) {
    return {
      content: legacyContent,
      heroImage: null,
      galleryImages: null,
      source: 'legacy',
    }
  }

  const hero = resolveServicePageHero(heroSection, legacyContent.hero, IMAGES, pageKey)
  const scope = resolveServicePageFeatures(featuresSection, legacyContent.scope)
  const galleryImages = resolveServicePageGallery(portfolioSection, IMAGES, pageKey)

  logRuntime('services', {
    source: 'cms',
    pageKey,
    hasHero: Boolean(hero.src),
    galleryCount: galleryImages.length,
  })

  return {
    content: {
      ...legacyContent,
      hero: {
        ...legacyContent.hero,
        eyebrow: hero.eyebrow,
        title: hero.title,
        subtitle: hero.subtitle,
        imageAlt: hero.imageAlt,
      },
      scope,
      gallery: {
        ...legacyContent.gallery,
        eyebrow: portfolioSection?.eyebrow ?? legacyContent.gallery?.eyebrow,
        title: portfolioSection?.title ?? legacyContent.gallery?.title,
        description: portfolioSection?.description ?? legacyContent.gallery?.description,
      },
    },
    heroImage: hero.src,
    galleryImages,
    servicesSection: getActiveServicesPageSection(extensions),
    servicesTabs: featuresSection?.groups ?? [],
    servicesGallery: galleryImages,
    source: 'cms',
  }
}

export function buildActiveServicesBundle(legacyBundle, remote) {
  const extensions = remote?.extensions ?? {}
  const base = { ...legacyBundle, extensions, _servicesSource: 'legacy' }

  if (!USE_PAGE_RESOLVER || !USE_SERVICES_V2 || remote?._pageSource !== 'blocks-full') {
    return base
  }

  logRuntime('services', { source: 'cms', extensions: Object.keys(extensions) })
  return { ...base, _servicesSource: 'cms' }
}

export { getActiveServicesSection, getActiveFeaturesSection }

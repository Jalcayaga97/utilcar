import { USE_CONTACT_V2, USE_PAGE_RESOLVER } from '@/lib/cms/config'
import { resolveContactHero, resolveContactMap } from '@/lib/cms/assets/resolveContactAssets'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { getActiveFaqSection } from '@/lib/cms/resolvers/faqBlockResolver'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { SITE } from '@/constants/site'
import { deepMerge } from '@/lib/cms/merge'

const PAGE_ID = 'contact'

export function resolveContactPageDocument(doc) {
  if (!doc) return { extensions: {}, warnings: [], source: 'legacy-fallback' }

  if (!USE_PAGE_RESOLVER || !USE_CONTACT_V2 || !doc.blocks?.length) {
    if (USE_CONTACT_V2 && import.meta.env.DEV) {
      warnPageLegacyFallback(PAGE_ID, { reason: 'no-blocks-or-flag-off' })
    }
    return { extensions: {}, warnings: [], source: 'legacy-fallback' }
  }

  return resolvePageFromBlocks(doc.blocks, { pageId: PAGE_ID })
}

export function getActiveContactFaqSection(extensions) {
  return getActiveFaqSection(extensions)
}

export function getActiveContactHeroSection(extensions) {
  return getActivePageSection(extensions, 'heroSection')
}

export function buildContactSection(extensions, legacyContent, remoteFlat = {}) {
  const heroSection = getActiveContactHeroSection(extensions)
  const faqSection = getActiveContactFaqSection(extensions)
  const mapMeta = extensions?.mapSection

  const hero = resolveContactHero(heroSection, legacyContent.hero)
  const map = resolveContactMap(mapMeta, legacyContent.map, SITE.mapsQuery)

  const merged = deepMerge(legacyContent, {
    hero: {
      ...legacyContent.hero,
      eyebrow: hero.eyebrow,
      title: hero.title,
      subtitle: hero.subtitle,
      imageAlt: hero.imageAlt,
    },
    map,
    faq: faqSection
      ? {
          eyebrow: faqSection.eyebrow || legacyContent.faq?.eyebrow,
          title: faqSection.title || legacyContent.faq?.title,
          description: faqSection.description || legacyContent.faq?.description,
        }
      : legacyContent.faq,
    faqItems: faqSection?.items?.length
      ? faqSection.items.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        }))
      : legacyContent.faqItems,
    ...remoteFlat,
  })

  return {
    content: merged,
    heroImage: hero.src,
    contactSection: {
      hero,
      faq: faqSection,
      map,
    },
    source: 'cms',
  }
}

export function buildActiveContactContent(legacyContent, remote) {
  const extensions = remote?.extensions ?? {}
  const base = { ...legacyContent, _contactSource: 'legacy' }

  if (!USE_PAGE_RESOLVER || !USE_CONTACT_V2 || remote?._pageSource !== 'blocks-full') {
    return base
  }

  const section = buildContactSection(extensions, legacyContent, remote)
  if (!section?.content) return base

  logRuntime('contact', {
    source: 'cms',
    faqCount: section.content.faqItems?.length ?? 0,
    hasHero: Boolean(section.heroImage),
  })

  return {
    ...section.content,
    _heroImage: section.heroImage,
    _contactSource: 'cms',
    _extensions: extensions,
  }
}

export { getActivePageSection }

import { USE_PAGE_RESOLVER, USE_WORK_V2 } from '@/lib/cms/config'
import { resolveWorkHero, resolveWorkPortfolioItem } from '@/lib/cms/assets/resolveWorkAssets'
import { buildHeroSection, findHeroBlock } from '@/lib/cms/resolvers/heroResolver'
import {
  getValidPortfolioItems,
  resolvePortfolioSection,
  findPortfolioBlockInList,
} from '@/lib/cms/resolvers/portfolioResolver'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { logRuntime, warnRuntime } from '@/lib/cms/runtimeLog'
import { deepMerge } from '@/lib/cms/merge'

const PAGE_ID = 'work'

export function resolveWorkPageDocument(doc) {
  if (!doc) return { extensions: {}, warnings: [], source: 'legacy-fallback' }

  if (!USE_PAGE_RESOLVER || !USE_WORK_V2 || !doc.blocks?.length) {
    if (USE_WORK_V2 && import.meta.env.DEV) {
      warnPageLegacyFallback(PAGE_ID, { reason: 'no-blocks-or-flag-off' })
    }
    return { extensions: {}, warnings: [], source: 'legacy-fallback' }
  }

  return resolvePageFromBlocks(doc.blocks, { pageId: PAGE_ID })
}

export function getActiveWorkHeroSection(extensions) {
  return getActivePageSection(extensions, 'heroSection')
}

export function getActiveWorkPortfolioSection(extensions) {
  const section = extensions?.portfolioSection
  if (!section) return null
  const items = getValidPortfolioItems(section.items)
  if (!items.length) return null
  return { ...section, items }
}

/**
 * Ensambla workSection contractual desde blocks + legacy flat.
 */
export function buildWorkSection(extensions, legacyBundle, remoteFlat = {}) {
  const heroSection = getActiveWorkHeroSection(extensions)
  const portfolioSection = getActiveWorkPortfolioSection(extensions)

  if (!portfolioSection) return null

  const legacyContent = legacyBundle.workContent
  const legacyById = new Map(legacyContent.portfolio.map((item) => [item.id, item]))

  const portfolio = portfolioSection.items.map((item, index) => {
    const legacyItem = legacyById.get(item.id) ?? legacyContent.portfolio[index]
    return resolveWorkPortfolioItem(item, legacyItem)
  })

  const heroResolved = resolveWorkHero(
    heroSection,
    legacyBundle.trabajosPageHero,
    legacyContent.page?.hero?.imageAlt,
  )

  const page = deepMerge(legacyContent.page, remoteFlat.page ?? {})
  if (heroSection?.title) {
    page.hero = {
      ...page.hero,
      eyebrow: heroSection.eyebrow ?? page.hero?.eyebrow,
      title: heroSection.title || page.hero?.title,
      subtitle: heroSection.subtitle || page.hero?.subtitle,
      imageAlt: heroResolved.alt || page.hero?.imageAlt,
    }
  }

  if (portfolioSection.title) {
    page.projects = {
      ...page.projects,
      eyebrow: portfolioSection.eyebrow ?? page.projects?.eyebrow,
      title: portfolioSection.title || page.projects?.title,
      description: portfolioSection.description ?? page.projects?.description,
    }
  }

  const ctaSection = extensions?.ctaSection
  if (ctaSection?.title) {
    page.cta = {
      ...page.cta,
      title: ctaSection.title || page.cta?.title,
      description: ctaSection.description ?? page.cta?.description,
    }
  }

  return {
    workContent: {
      ...legacyContent,
      page,
      portfolio,
      filters: remoteFlat.filters?.length ? remoteFlat.filters : legacyContent.filters,
      ui: remoteFlat.ui ? deepMerge(legacyContent.ui, remoteFlat.ui) : legacyContent.ui,
    },
    trabajosPageHero: heroResolved.src,
    workItems: portfolio,
    workCategories: legacyContent.filters,
    warnings: [],
    source: 'cms',
  }
}

/**
 * Bundle activo: CMS-first completo o legacy total (sin mezcla parcial).
 */
export function buildActiveWorkBundle(legacyBundle, remote) {
  const extensions = remote?.extensions ?? {}
  const base = {
    ...legacyBundle,
    extensions,
    _workSource: 'legacy',
  }

  if (!USE_PAGE_RESOLVER || !USE_WORK_V2 || remote?._pageSource !== 'blocks-full') {
    return base
  }

  const workSection = buildWorkSection(extensions, legacyBundle, remote)
  if (!workSection?.workItems?.length) {
    warnRuntime('work', 'invalid-section', { reason: 'empty-portfolio' })
    return base
  }

  logRuntime('work', {
    source: 'cms',
    items: workSection.workItems.length,
    categories: workSection.workCategories?.length ?? 0,
  })

  return {
    workContent: workSection.workContent,
    trabajosPageHero: workSection.trabajosPageHero,
    extensions,
    workSection,
    _workSource: 'cms',
  }
}

export function getActiveWorkSection(bundle) {
  if (bundle?._workSource !== 'cms') return null
  return bundle.workSection ?? null
}

export { findHeroBlock, findPortfolioBlockInList, buildHeroSection, resolvePortfolioSection }

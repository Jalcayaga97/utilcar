import { isSanityEnabled, USE_PAGE_RESOLVER, USE_WORK_V2 } from '@/lib/cms/config'

import { resolveWorkHero, resolveWorkPortfolioItem } from '@/lib/cms/assets/resolveWorkAssets'

import { buildHeroSection, findHeroBlock } from '@/lib/cms/resolvers/heroResolver'

import {
  getValidPortfolioItems,
  resolvePortfolioSection,
  findPortfolioBlockInList,
} from '@/lib/cms/resolvers/portfolioResolver'

import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'

import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'

import { getActiveRichTextSection } from '@/lib/cms/resolvers/richTextBlockResolver'

import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'

import { buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'

import { logRuntime } from '@/lib/cms/runtimeLog'

import { deepMerge } from '@/lib/cms/merge'

import {
  buildWorkFiltersFromProjects,
  mapWorkProjectsToPortfolio,
} from '@/lib/cms/resolvers/workProjectsResolver'

const PAGE_ID = 'work'

const DEFAULT_PAGE_SIZE = 9

const DEFAULT_HOME_PREVIEW_MAX = 4

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

function emptyWorkPageContent() {
  return {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    intro: { eyebrow: '', title: '', paragraphs: [] },
    projects: { eyebrow: '', title: '', description: '' },
    cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
  }
}

/** CMS activo cuando blocks[] resolvió extensions (mismo criterio que serviceSubPage). */
function isWorkPageCms(resolved) {
  const extensions = resolved?.extensions ?? {}
  return USE_PAGE_RESOLVER && USE_WORK_V2 && Object.keys(extensions).length > 0
}

/** CTA Trabajos — copy desde ctaBlock; botones editables en Página Trabajos. */
export function resolveWorkPageCta(ctaSection, globalCta) {
  const global = globalCta ?? buildGlobalServiceCta()
  return {
    title: ctaSection?.title || global.title,
    description: ctaSection?.description || global.description,
    primaryLabel:
      ctaSection?.primaryLabel || ctaSection?.buttonLabel || global.primaryLabel,
    primaryTo: ctaSection?.primaryTo || ctaSection?.buttonLink || global.primaryTo,
  }
}

/**
 * Ensambla contenido de Página Trabajos 100% desde blocks[] (sin merge page.* legacy).
 */
export function buildWorkPageContentFromCms(resolved, options = {}) {
  const { extensions } = resolved
  const globalCta = options.globalCta ?? buildGlobalServiceCta()

  const heroSection = getActiveWorkHeroSection(extensions)
  const richTextSection = getActiveRichTextSection(extensions)
  const portfolioSection = extensions?.portfolioSection
  const ctaSection = extensions?.ctaSection

  const heroResolved = resolveWorkHero(
    heroSection,
    null,
    heroSection?.image?.alt ?? '',
  )

  const content = emptyWorkPageContent()

  content.hero = {
    eyebrow: heroSection?.eyebrow ?? '',
    title: heroSection?.title ?? '',
    subtitle: heroSection?.subtitle ?? '',
    imageAlt: heroResolved.alt || heroSection?.image?.alt || '',
  }

  content.intro = {
    eyebrow: richTextSection?.eyebrow ?? '',
    title: richTextSection?.title ?? '',
    paragraphs: richTextSection?.paragraphs ?? [],
  }

  content.projects = {
    eyebrow: portfolioSection?.eyebrow ?? '',
    title: portfolioSection?.title ?? '',
    description: portfolioSection?.description ?? '',
  }

  content.cta = resolveWorkPageCta(ctaSection, globalCta)

  return {
    content,
    heroImage: heroResolved.src,
    seo: getActiveSeoSection(extensions),
    source: 'cms',
  }
}

function assembleWorkContent(legacyContent, pageContent, workProjects, remoteUi = {}) {
  const portfolio = mapWorkProjectsToPortfolio(workProjects)
  const filters = buildWorkFiltersFromProjects(workProjects, legacyContent.filters)
  const ui = deepMerge(legacyContent.ui, remoteUi)
  if (!ui.pageSize) ui.pageSize = DEFAULT_PAGE_SIZE
  if (!ui.homePreviewMax) ui.homePreviewMax = DEFAULT_HOME_PREVIEW_MAX

  return {
    ...legacyContent,
    page: pageContent,
    portfolio,
    preview: [],
    filters,
    ui,
  }
}

/**
 * Runtime display — CMS-first completo o legacy completo (sin mezcla page.* + blocks).
 */
export function mapWorkPageRuntime(legacyBundle, resolved = {}, options = {}) {
  const extensions = resolved?.extensions ?? {}
  const workProjects = options.workProjects ?? []
  const legacyContent = legacyBundle.workContent

  if (!isWorkPageCms(resolved)) {
    logRuntime('work-page', { source: 'legacy', portfolio: legacyContent.portfolio?.length ?? 0 })
    return {
      ...legacyBundle,
      extensions,
      workProjects,
      _workSource: 'legacy',
    }
  }

  const built = buildWorkPageContentFromCms(resolved, options)
  const workContent = assembleWorkContent(
    legacyContent,
    built.content,
    workProjects,
    resolved.ui ?? {},
  )

  logRuntime('work-page', {
    source: 'cms-blocks',
    portfolio: workContent.portfolio.length,
    categories: workContent.filters.length,
  })

  const sectionPayload = {
    workContent,
    trabajosPageHero: built.heroImage,
    workItems: workContent.portfolio,
    workCategories: workContent.filters,
    warnings: [],
    source: 'cms',
  }

  return {
    workContent,
    trabajosPageHero: built.heroImage,
    extensions,
    workProjects,
    seo: built.seo,
    workSection: sectionPayload,
    _workSource: 'cms',
  }
}

/** @deprecated — metadata de bloque; los ítems vienen del catálogo Proyectos CMS. */
export function getActiveWorkPortfolioSection(extensions) {
  const section = extensions?.portfolioSection
  if (!section) return null
  const items = getValidPortfolioItems(section.items)
  if (!items.length) return null
  return { ...section, items }
}

/**
 * Bundle Trabajos desde catálogo Proyectos CMS + blocks[] editoriales.
 */
export function buildWorkBundleFromProjects(legacyBundle, remote = {}, workProjects = []) {
  return mapWorkPageRuntime(legacyBundle, remote, { workProjects })
}

/**
 * Ensambla workSection contractual desde blocks + legacy flat.
 * @deprecated Preferir mapWorkPageRuntime cuando Sanity está activo.
 */
export function buildWorkSection(extensions, legacyBundle, remoteFlat = {}) {
  const heroSection = getActiveWorkHeroSection(extensions)
  const portfolioSection = getActiveWorkPortfolioSection(extensions)
  const workProjects = remoteFlat.workProjects ?? []

  const legacyContent = legacyBundle.workContent
  const legacyById = new Map(legacyContent.portfolio.map((item) => [item.id, item]))

  let portfolio = []
  if (workProjects.length) {
    portfolio = mapWorkProjectsToPortfolio(workProjects, legacyById)
  } else if (portfolioSection?.items?.length) {
    portfolio = portfolioSection.items.map((item, index) => {
      const legacyItem = legacyById.get(item.id) ?? legacyContent.portfolio[index]
      return resolveWorkPortfolioItem(item, legacyItem)
    })
  } else {
    return null
  }

  if (!portfolio.length) return null

  const built = buildWorkPageContentFromCms({ extensions })
  const workContent = assembleWorkContent(legacyContent, built.content, workProjects, remoteFlat.ui ?? {})

  return {
    workContent,
    trabajosPageHero: built.heroImage,
    workItems: portfolio,
    workCategories: legacyContent.filters,
    warnings: [],
    source: 'cms',
  }
}

/**
 * Bundle activo: blocks[] + catálogo Proyectos CMS cuando Sanity ON; legacy local si no.
 */
export function buildActiveWorkBundle(legacyBundle, remote = {}) {
  const workProjects = remote?.workProjects ?? []

  if (!isSanityEnabled()) {
    return {
      ...legacyBundle,
      extensions: remote?.extensions ?? {},
      workProjects,
      _workSource: 'legacy',
    }
  }

  return mapWorkPageRuntime(legacyBundle, remote, { workProjects })
}

export function getActiveWorkSection(bundle) {
  if (bundle?._workSource !== 'cms') return null
  return bundle.workSection ?? null
}

export { findHeroBlock, findPortfolioBlockInList, buildHeroSection, resolvePortfolioSection }

import {
  resolveServicePageFeatures,
  resolveServicePageHero,
} from '@/lib/cms/assets/resolveServicePageAssets'
import { normalizeServiceTabs } from '@/lib/cms/contracts/serviceTabContract'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { getActiveFeaturesSection } from '@/lib/cms/resolvers/featuresBlockResolver'
import { getActiveRichTextSection } from '@/lib/cms/resolvers/richTextBlockResolver'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'
import { getActiveServicesSection } from '@/lib/cms/resolvers/servicesResolver'
import { resolveServicePageCta, buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'
import {
  logServicePortfolio,
  resolveServicePagePortfolio,
} from '@/lib/cms/resolvers/workProjectsResolver'
import {
  logServiceHeroAudit,
  logServiceHeroTrace,
  logServicePortfolioAudit,
  logServiceRichTextTrace,
  logServiceRichTextAudit,
} from '@/lib/cms/servicePageAuditLog'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { isSanityEnabled, USE_PAGE_RESOLVER, USE_SERVICES_V2 } from '@/lib/cms/config'

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

export function resolveServiceSubPageDocument(doc, pageKey) {
  if (!doc) return { extensions: {}, warnings: [], source: 'legacy-fallback', tabs: [] }

  const tabs = normalizeServiceTabs(doc.tabs ?? [])
  const tabsSection = doc.tabsSection ?? null
  const introExtras = doc.introExtras ?? null

  if (!USE_PAGE_RESOLVER || !USE_SERVICES_V2 || !doc.blocks?.length) {
    if (USE_SERVICES_V2 && import.meta.env.DEV) {
      warnPageLegacyFallback(`service:${pageKey}`, { reason: 'no-blocks-or-flag-off' })
    }
    return {
      extensions: {},
      warnings: [],
      source: 'legacy-fallback',
      tabs,
      tabsSection,
      introExtras,
    }
  }

  const resolved = resolvePageFromBlocks(doc.blocks, { pageId: `service:${pageKey}` })

  return {
    ...resolved,
    tabs,
    tabsSection,
    introExtras,
  }
}

export function getActiveServicesPageSection(extensions) {
  const section = extensions?.servicesSection
  if (!section) return null
  const items = (section.items ?? []).filter((item) => String(item?.title ?? '').trim())
  if (!items.length) return null
  return { ...section, items }
}

function emptyServicePageContent() {
  return {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    intro: { eyebrow: '', title: '', paragraphs: [] },
    scope: {
      eyebrow: '',
      title: '',
      description: '',
      lists: { soluciones: { title: '', items: [] }, caracteristicas: { title: '', items: [] } },
    },
    gallery: { eyebrow: '', title: '', description: '' },
    specs: { eyebrow: '', title: '', description: '', sections: [] },
    categories: { eyebrow: '', title: '', description: '' },
    catalog: { eyebrow: '', title: '', description: '' },
    brands: { eyebrow: '', title: '', description: '' },
    cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
  }
}

/**
 * Ensambla contenido de página de servicio 100% desde CMS (sin merge local).
 */
export function buildServicePageContentFromCms(pageKey, resolved, options = {}) {
  const { extensions, tabs, tabsSection, introExtras } = resolved
  const globalCta = options.globalCta ?? buildGlobalServiceCta()
  const workProjects = options.workProjects ?? []
  const heroSection = getActivePageSection(extensions, 'heroSection')
  logServiceHeroAudit({
    pageKey,
    layer: 'buildServicePageContentFromCms',
    extensionKeys: Object.keys(extensions),
    heroSectionHighlights: heroSection?.highlights ?? [],
    heroSectionImageUrl: heroSection?.image?.url ?? null,
    isCmsPath: true,
  })
  const richTextSection = getActiveRichTextSection(extensions)
  const featuresSection = getActiveFeaturesSection(extensions)
  const portfolioSection = extensions?.portfolioSection
  const ctaSection = extensions?.ctaSection

  const hero = resolveServicePageHero(heroSection, null, null, pageKey)
  const portfolioResolved = resolveServicePagePortfolio({
    pageKey,
    workProjects,
    portfolioSection,
  })

  logServicePortfolio(pageKey, {
    projectCount: portfolioResolved.projects.length,
    source: portfolioResolved.source,
    portfolioTitle: portfolioResolved.meta.title,
    portfolioDescription: portfolioResolved.meta.description,
  })

  const groups = featuresSection?.groups ?? []
  const scope = resolveServicePageFeatures(featuresSection, emptyServicePageContent().scope)

  const content = emptyServicePageContent()

  content.hero = {
    eyebrow: hero.eyebrow ?? '',
    title: hero.title ?? '',
    subtitle: hero.subtitle ?? '',
    highlights: hero.highlights ?? [],
    imageAlt: hero.imageAlt ?? '',
  }

  const introParagraphs = richTextSection?.paragraphs ?? []
  logServiceRichTextAudit({
    pageKey,
    runtimeSource: 'cms',
    hasBody: introParagraphs.length > 0,
    bodyBlocks: introParagraphs.length,
    paragraphsCount: introParagraphs.length,
  })
  logServiceRichTextTrace({
    pageKey,
    runtimeSource: 'cms',
    hasRichTextBlock: Boolean(richTextSection),
    title: richTextSection?.title ?? '',
    eyebrow: richTextSection?.eyebrow ?? '',
    contentLength: introParagraphs.length,
    contentType: Array.isArray(introParagraphs) ? 'paragraphs[]' : typeof introParagraphs,
    paragraphPreview: introParagraphs.slice(0, 2).map((p) => String(p).slice(0, 80)),
  })

  content.intro = {
    eyebrow: richTextSection?.eyebrow ?? '',
    title: richTextSection?.title ?? '',
    paragraphs: introParagraphs,
    ...(introExtras?.procesoTemplado
      ? {
          procesoTemplado: introExtras.procesoTemplado,
          especificaciones: introExtras.especificaciones ?? [],
        }
      : {}),
  }

  content.scope = scope
  content.specs = {
    eyebrow: featuresSection?.eyebrow ?? '',
    title: featuresSection?.title ?? '',
    description: featuresSection?.description ?? '',
    sections: groups.map((g) => ({ title: g.title, items: g.items ?? [] })),
  }

  content.gallery = {
    eyebrow: portfolioResolved.meta.eyebrow,
    title: portfolioResolved.meta.title,
    description: portfolioResolved.meta.description,
  }

  const tabHeader = tabsSection ?? {
    eyebrow: featuresSection?.eyebrow,
    title: featuresSection?.title,
    description: featuresSection?.description,
  }

  content.brands = {
    eyebrow: tabHeader.eyebrow ?? '',
    title: tabHeader.title ?? '',
    description: tabHeader.description ?? '',
  }
  content.categories = { ...content.brands }
  content.catalog = { ...content.brands }

  content.cta = resolveServicePageCta(ctaSection, globalCta)

  return {
    content,
    heroImage: hero.src,
    portfolioProjects: portfolioResolved.projects,
    portfolioSource: portfolioResolved.source,
    tabs,
    seo: getActiveSeoSection(extensions),
    source: 'cms',
  }
}

/**
 * Runtime display — CMS-first completo o legacy completo (sin mezcla).
 */
/** CMS-first cuando el fetch ya resolvió extensions desde blocks[] (no depender solo de _pageSource). */
function isServiceSubPageCms(resolved) {
  const extensions = resolved?.extensions ?? {}
  return (
    USE_PAGE_RESOLVER &&
    USE_SERVICES_V2 &&
    Object.keys(extensions).length > 0
  )
}

function tabHasCmsGallery(tab) {
  return (tab?.gallery ?? []).some(
    (item) => typeof item?.src === 'string' && item.src.trim().length > 0,
  )
}

function resolveServicePageTabs(legacyContent, resolved) {
  const cmsTabs = resolved?.tabs ?? []
  if (cmsTabs.some(tabHasCmsGallery)) return cmsTabs
  return legacyContent.tabs ?? []
}

export function mapServicePageRuntime(pageKey, legacyContent, resolved, options = {}) {
  const extensions = resolved?.extensions ?? {}
  const workProjects = options.workProjects ?? []

  const cmsActive = isServiceSubPageCms(resolved)

  logServiceHeroAudit({
    pageKey,
    layer: 'mapServicePageRuntime',
    runtimeSource: cmsActive ? 'cms' : 'legacy',
    isSanityEnabled: isSanityEnabled(),
    usePageResolver: USE_PAGE_RESOLVER,
    useServicesV2: USE_SERVICES_V2,
    extensionKeys: Object.keys(extensions),
    resolvedSource: resolved?.source ?? resolved?._pageSource,
    workProjectsIsArray: Array.isArray(workProjects),
    workProjectsCount: Array.isArray(workProjects) ? workProjects.length : 0,
  })

  if (!cmsActive) {
    logServiceRichTextTrace({
      pageKey,
      runtimeSource: 'legacy',
      hasRichTextBlock: false,
      title: legacyContent?.intro?.title ?? '',
      eyebrow: legacyContent?.intro?.eyebrow ?? '',
      contentLength: legacyContent?.intro?.paragraphs?.length ?? 0,
      contentType: 'paragraphs[] (local)',
    })
    logServiceHeroTrace({
      pageKey,
      runtimeSource: 'legacy',
      hasCmsHero: false,
      heroImage: null,
      heroImageResolved: null,
      highlightsRaw: [],
      highlightsResolved: legacyContent?.hero?.highlights ?? [],
      highlightsCount: (legacyContent?.hero?.highlights ?? []).length,
      extensionKeys: Object.keys(extensions),
    })
    const portfolioResolved = resolveServicePagePortfolio({
      pageKey,
      workProjects,
      portfolioSection: null,
      legacyGalleryMeta: legacyContent.gallery,
    })
    logServicePortfolio(pageKey, {
      projectCount: portfolioResolved.projects.length,
      source: portfolioResolved.source,
      portfolioTitle: portfolioResolved.meta.title,
      portfolioDescription: portfolioResolved.meta.description,
    })
    return {
      content: legacyContent,
      heroImage: null,
      portfolioProjects: portfolioResolved.projects,
      portfolioSource: portfolioResolved.source,
      tabs: resolveServicePageTabs(legacyContent, resolved),
      seo: null,
      source: 'legacy',
    }
  }

  const built = buildServicePageContentFromCms(pageKey, resolved, options)

  logServiceHeroTrace({
    pageKey,
    runtimeSource: 'cms',
    hasCmsHero: Boolean(extensions?.heroSection),
    heroImage: built.heroImage?.startsWith?.('data:') ? '(placeholder)' : built.heroImage,
    heroImageResolved: built.heroImage,
    highlightsRaw: extensions?.heroSection?.highlights ?? [],
    highlightsResolved: built.content?.hero?.highlights ?? [],
    highlightsCount: built.content?.hero?.highlights?.length ?? 0,
    extensionKeys: Object.keys(extensions),
  })

  logRuntime('services', {
    source: 'cms',
    pageKey,
    hasHero: Boolean(built.heroImage),
    highlightsCount: built.content?.hero?.highlights?.length ?? 0,
    portfolioCount: built.portfolioProjects?.length ?? 0,
    portfolioSource: built.portfolioSource,
    tabCount: built.tabs?.length ?? 0,
  })

  return {
    ...built,
    servicesSection: getActiveServicesPageSection(extensions),
    servicesTabs: built.tabs,
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

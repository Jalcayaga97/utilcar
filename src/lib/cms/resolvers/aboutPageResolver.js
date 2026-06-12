import { isSanityEnabled, USE_ABOUT_V2, USE_PAGE_RESOLVER } from '@/lib/cms/config'
import { resolveAboutHero } from '@/lib/cms/assets/resolveAboutAssets'
import { enrichSeoSectionForRuntime } from '@/lib/cms/contracts/seoBlockContract'
import { getActiveFeatureGridSection } from '@/lib/cms/resolvers/featureGridBlockResolver'
import { getActiveRichTextSection } from '@/lib/cms/resolvers/richTextBlockResolver'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { logRuntime } from '@/lib/cms/runtimeLog'

const PAGE_ID = 'about'

export function resolveAboutPageDocument(doc) {
  if (!doc) return { extensions: {}, warnings: [], source: 'legacy-fallback' }

  if (!USE_PAGE_RESOLVER || !USE_ABOUT_V2 || !doc.blocks?.length) {
    if (USE_ABOUT_V2 && import.meta.env.DEV) {
      warnPageLegacyFallback(PAGE_ID, { reason: 'no-blocks-or-flag-off' })
    }
    return { extensions: {}, warnings: [], source: 'legacy-fallback' }
  }

  return resolvePageFromBlocks(doc.blocks, { pageId: PAGE_ID })
}

export function getActiveAboutHeroSection(extensions) {
  return getActivePageSection(extensions, 'heroSection')
}

export function emptyAboutPageContent() {
  return {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    historia: { eyebrow: '', title: '', paragraphs: [] },
    features: { eyebrow: '', title: '', description: '', items: [] },
    cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
  }
}

function isAboutPageCms(resolved) {
  const extensions = resolved?.extensions ?? {}
  return USE_PAGE_RESOLVER && USE_ABOUT_V2 && Object.keys(extensions).length > 0
}

export function resolveAboutPageCta(ctaSection, legacyCta) {
  const legacy = legacyCta ?? {}
  return {
    title: ctaSection?.title || legacy.title || '',
    description: ctaSection?.description || legacy.description || '',
    primaryLabel:
      ctaSection?.primaryLabel ||
      ctaSection?.buttonLabel ||
      legacy.primaryLabel ||
      '',
    primaryTo:
      ctaSection?.primaryTo || ctaSection?.buttonLink || legacy.primaryTo || '/contacto',
  }
}

export function buildAboutPageContentFromCms(resolved, options = {}) {
  const { extensions } = resolved
  const useLegacyMerge = options.useLegacyMerge === true
  const legacyContent = options.legacyContent ?? emptyAboutPageContent()

  const heroSection = getActiveAboutHeroSection(extensions)
  const richTextSection = getActiveRichTextSection(extensions)
  const featureGridSection = getActiveFeatureGridSection(extensions)
  const ctaSection = extensions?.ctaSection

  const heroResolved = resolveAboutHero(
    heroSection,
    useLegacyMerge ? legacyContent.hero : null,
  )
  const content = emptyAboutPageContent()

  content.hero = {
    eyebrow: heroSection?.eyebrow ?? (useLegacyMerge ? legacyContent.hero?.eyebrow : '') ?? '',
    title: heroSection?.title ?? (useLegacyMerge ? legacyContent.hero?.title : '') ?? '',
    subtitle: heroSection?.subtitle ?? (useLegacyMerge ? legacyContent.hero?.subtitle : '') ?? '',
    imageAlt:
      heroResolved.alt ||
      (useLegacyMerge ? legacyContent.hero?.imageAlt : '') ||
      '',
  }

  content.historia = {
    eyebrow:
      richTextSection?.eyebrow ??
      (useLegacyMerge ? legacyContent.historia?.eyebrow : '') ??
      '',
    title:
      richTextSection?.title ?? (useLegacyMerge ? legacyContent.historia?.title : '') ?? '',
    paragraphs: richTextSection?.paragraphs?.length
      ? richTextSection.paragraphs
      : useLegacyMerge
        ? (legacyContent.historia?.paragraphs ?? [])
        : [],
  }

  content.features = featureGridSection
    ? {
        eyebrow: featureGridSection.eyebrow || (useLegacyMerge ? legacyContent.features?.eyebrow : '') || '',
        title: featureGridSection.title || (useLegacyMerge ? legacyContent.features?.title : '') || '',
        description:
          featureGridSection.description ||
          (useLegacyMerge ? legacyContent.features?.description : '') ||
          '',
        items: featureGridSection.items,
      }
    : useLegacyMerge
      ? { ...legacyContent.features }
      : { eyebrow: '', title: '', description: '', items: [] }

  content.cta = resolveAboutPageCta(
    ctaSection,
    useLegacyMerge ? legacyContent.cta : undefined,
  )

  return {
    content,
    heroImage: heroResolved.src,
    seo: enrichSeoSectionForRuntime(
      getActiveSeoSection(extensions),
      extensions?.heroSection,
    ),
    source: 'cms',
  }
}

export function mapAboutPageRuntime(legacyContent, resolved = {}) {
  const extensions = resolved?.extensions ?? {}

  if (!isSanityEnabled() || !isAboutPageCms(resolved)) {
    logRuntime('about-page', { source: 'legacy' })
    return {
      content: legacyContent,
      heroImage: null,
      seo: null,
      extensions,
      _aboutSource: 'legacy',
    }
  }

  const built = buildAboutPageContentFromCms(resolved, {
    legacyContent,
    useLegacyMerge: !isAboutPageCms(resolved),
  })

  logRuntime('about-page', {
    source: 'cms-blocks',
    featureItems: built.content.features?.items?.length ?? 0,
  })

  return {
    content: built.content,
    heroImage: built.heroImage,
    seo: built.seo,
    extensions,
    _aboutSource: 'cms',
  }
}

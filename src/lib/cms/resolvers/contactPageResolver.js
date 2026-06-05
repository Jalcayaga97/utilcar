import { isSanityEnabled, USE_CONTACT_V2, USE_PAGE_RESOLVER } from '@/lib/cms/config'
import { resolveContactHero } from '@/lib/cms/assets/resolveContactAssets'
import { buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'
import { getActiveFaqSection } from '@/lib/cms/resolvers/faqBlockResolver'
import { getActiveRichTextSection } from '@/lib/cms/resolvers/richTextBlockResolver'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { logRuntime } from '@/lib/cms/runtimeLog'

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

export function getActiveContactHeroSection(extensions) {
  return getActivePageSection(extensions, 'heroSection')
}

function isContactPageCms(resolved) {
  const extensions = resolved?.extensions ?? {}
  return USE_PAGE_RESOLVER && USE_CONTACT_V2 && Object.keys(extensions).length > 0
}

function emptyContactPageContent() {
  return {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    intro: { formHint: '', paragraphs: [] },
    details: {
      title: '',
      description: '',
      cards: {
        phone: '',
        email: '',
        address: '',
        hours: { title: '' },
      },
    },
    map: { eyebrow: '', title: '', iframeTitle: '' },
    faq: { eyebrow: '', title: '', description: '' },
    cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
    form: {
      heading: '',
      fields: {},
      submit: { idle: '', loading: '' },
      success: { title: '', message: '', resetLabel: '' },
      error: '',
    },
    servicios: [],
    faqItems: [],
  }
}

/** CTA Contacto — copy desde ctaBlock de la página. */
export function resolveContactPageCta(ctaSection, legacyCta) {
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
      ctaSection?.primaryTo || ctaSection?.buttonLink || legacy.primaryTo || '#formulario',
  }
}

/**
 * Contenido editorial Contacto 100% desde blocks[] (+ form/servicios del documento).
 */
export function buildContactPageContentFromCms(resolved, options = {}) {
  const { extensions } = resolved
  const legacyContent = options.legacyContent ?? emptyContactPageContent()

  const heroSection = getActiveContactHeroSection(extensions)
  const richTextSection = getActiveRichTextSection(extensions)
  const faqSection = getActiveFaqSection(extensions)
  const ctaSection = extensions?.ctaSection

  const heroResolved = resolveContactHero(heroSection, legacyContent.hero)

  const content = emptyContactPageContent()

  content.hero = {
    eyebrow: heroSection?.eyebrow ?? legacyContent.hero?.eyebrow ?? '',
    title: heroSection?.title ?? legacyContent.hero?.title ?? '',
    subtitle: heroSection?.subtitle ?? legacyContent.hero?.subtitle ?? '',
    imageAlt: heroResolved.alt || legacyContent.hero?.imageAlt || '',
  }

  const paragraphs = richTextSection?.paragraphs?.length
    ? richTextSection.paragraphs
    : legacyContent.intro?.paragraphs ?? []

  content.intro = {
    formHint: legacyContent.intro?.formHint ?? '',
    paragraphs,
  }

  content.details = legacyContent.details ?? content.details
  content.map = legacyContent.map ?? content.map

  content.faq = faqSection
    ? {
        eyebrow: faqSection.eyebrow || legacyContent.faq?.eyebrow || '',
        title: faqSection.title || legacyContent.faq?.title || '',
        description: faqSection.description || legacyContent.faq?.description || '',
      }
    : { ...legacyContent.faq }

  content.faqItems = faqSection?.items?.length
    ? faqSection.items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      }))
    : [...(legacyContent.faqItems ?? [])]

  content.cta = resolveContactPageCta(ctaSection, legacyContent.cta)

  content.form = options.form ?? legacyContent.form ?? content.form
  content.servicios = options.servicios?.length
    ? options.servicios
    : [...(legacyContent.servicios ?? [])]

  return {
    content,
    heroImage: heroResolved.src,
    seo: getActiveSeoSection(extensions),
    source: 'cms',
  }
}

function mergeContactDocumentFields(legacyContent, remote = {}) {
  return {
    ...legacyContent,
    form: remote.form ?? legacyContent.form,
    servicios: remote.servicios?.length ? remote.servicios : legacyContent.servicios,
  }
}

/** Formulario y servicios del documento — disponibles aunque blocks[] use ruta legacy. */
function applyRemoteFormAndServicios(legacyContent, remote = {}) {
  if (!remote?.form) return legacyContent
  return mergeContactDocumentFields(legacyContent, remote)
}

/**
 * Runtime — CMS-first completo o legacy completo (sin deepMerge híbrido).
 */
export function mapContactPageRuntime(legacyContent, resolved = {}, options = {}) {
  const extensions = resolved?.extensions ?? {}

  if (!isSanityEnabled() || !isContactPageCms(resolved)) {
    const remote = options.remote ?? {}
    const content = applyRemoteFormAndServicios(legacyContent, remote)

    logRuntime('contact-page', {
      source: 'legacy',
      faqItems: content.faqItems?.length ?? 0,
      hasRemoteForm: Boolean(remote?.form),
      formHeading: content.form?.heading ?? '',
    })
    return {
      content,
      heroImage: null,
      seo: null,
      extensions,
      _contactSource: 'legacy',
    }
  }

  const mergedLegacy = mergeContactDocumentFields(legacyContent, options.remote ?? {})
  const built = buildContactPageContentFromCms(resolved, {
    legacyContent: mergedLegacy,
    form: options.remote?.form,
    servicios: options.remote?.servicios,
  })

  logRuntime('contact-page', {
    source: 'cms-blocks',
    faqItems: built.content.faqItems?.length ?? 0,
    hasHero: Boolean(built.heroImage),
  })

  return {
    content: built.content,
    heroImage: built.heroImage,
    seo: built.seo,
    extensions,
    _contactSource: 'cms',
  }
}

export function buildActiveContactBundle(legacyContent, remote = {}) {
  if (!isSanityEnabled()) {
    return mapContactPageRuntime(legacyContent, {}, { remote })
  }

  const resolved = remote
    ? {
        extensions: remote.extensions ?? {},
        _pageSource: remote._pageSource,
      }
    : { extensions: {} }

  return mapContactPageRuntime(legacyContent, resolved, { remote })
}

/** @deprecated Usar mapContactPageRuntime / getContactPageDisplay */
export function buildActiveContactContent(legacyContent, remote) {
  const bundle = buildActiveContactBundle(legacyContent, remote)
  return {
    ...bundle.content,
    _heroImage: bundle.heroImage,
    _contactSource: bundle._contactSource,
    _extensions: bundle.extensions,
  }
}

export { getActivePageSection, getActiveFaqSection }

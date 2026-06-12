import { isSanityEnabled, USE_CONTACT_V2, USE_PAGE_RESOLVER } from '@/lib/cms/config'
import { contactContent } from '@/content/contact'
import { resolveContactHero, resolveContactMap } from '@/lib/cms/assets/resolveContactAssets'
import { findMapBlockRaw } from '@/lib/cms/resolvers/mapBlockResolver'
import { buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'
import { getActiveFaqSection } from '@/lib/cms/resolvers/faqBlockResolver'
import { getActiveRichTextSection } from '@/lib/cms/resolvers/richTextBlockResolver'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'
import { enrichSeoSectionForRuntime } from '@/lib/cms/contracts/seoBlockContract'
import { resolvePageFromBlocks, getActivePageSection } from '@/lib/cms/resolvers/global/pageResolver'
import { warnPageLegacyFallback } from '@/lib/cms/resolvers/global/pageResolverLog'
import { logRuntime } from '@/lib/cms/runtimeLog'
import { buildContactFormServiceOptions } from '@/lib/services/serviceCatalog'

const PAGE_ID = 'contact'

const CONTACT_FORM_FIELD_KEYS = ['nombre', 'empresa', 'mail', 'telefono', 'servicio', 'consulta']

function safeString(value) {
  if (value == null) return ''
  const s = String(value).trim()
  return s || ''
}

function mergeFormField(defaults, remote) {
  const base = defaults ?? {}
  const fromRemote = remote ?? {}
  const field = {
    label: safeString(fromRemote.label) || safeString(base.label) || '',
    placeholder: safeString(fromRemote.placeholder) || safeString(base.placeholder) || '',
  }
  const required = fromRemote.required ?? base.required
  if (required != null) field.required = Boolean(required)
  return field
}

/** Formulario contacto — merge CMS parcial + defaults estructurales (labels, submit, success). */
export function resolveContactForm(remote = {}) {
  const defaults = contactContent.form
  const remoteFields = remote?.fields ?? {}
  const fields = Object.fromEntries(
    CONTACT_FORM_FIELD_KEYS.map((key) => [
      key,
      mergeFormField(defaults.fields[key], remoteFields[key]),
    ]),
  )

  const hasHeading = remote != null && Object.prototype.hasOwnProperty.call(remote, 'heading')
  const hasError = remote != null && Object.prototype.hasOwnProperty.call(remote, 'error')

  return {
    heading: hasHeading ? safeString(remote.heading) : safeString(defaults.heading),
    fields,
    submit: {
      idle: safeString(remote?.submit?.idle) || safeString(defaults.submit?.idle) || 'Enviar consulta',
      loading:
        safeString(remote?.submit?.loading) ||
        safeString(defaults.submit?.loading) ||
        'Enviando...',
    },
    success: {
      title:
        safeString(remote?.success?.title) ||
        safeString(defaults.success?.title) ||
        'Consulta enviada',
      message: safeString(remote?.success?.message) || safeString(defaults.success?.message) || '',
      resetLabel:
        safeString(remote?.success?.resetLabel) ||
        safeString(defaults.success?.resetLabel) ||
        'Enviar otra consulta',
    },
    error: hasError ? safeString(remote.error) : safeString(defaults.error),
  }
}

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

const CONTACT_DETAIL_CARD_DEFAULTS = {
  phone: { enabled: true, title: 'Teléfono' },
  email: { enabled: true, title: 'Correos' },
  address: { enabled: true, title: 'Dirección' },
  hours: { enabled: true, title: 'Horario' },
}

/** Etiquetas estructurales de UI — fallback si contactPage.details no está poblado. */
const CONTACT_UI_DEFAULTS = {
  details: {
    title: 'Datos de contacto',
    description: '',
    cards: { ...CONTACT_DETAIL_CARD_DEFAULTS },
  },
  map: {
    eyebrow: 'Ubicación',
    title: 'Visítenos en taller',
    iframeTitle: 'Ubicación Utilcar Conversiones en Google Maps',
  },
}

export function emptyContactPageContent() {
  return {
    hero: { eyebrow: '', title: '', subtitle: '', imageAlt: '' },
    intro: { formHint: '', paragraphs: [] },
    details: { ...CONTACT_UI_DEFAULTS.details },
    map: { ...CONTACT_UI_DEFAULTS.map },
    faq: { eyebrow: '', title: '', description: '' },
    cta: { title: '', description: '', primaryLabel: '', primaryTo: '' },
    form: resolveContactForm({ heading: '', error: '' }),
    servicios: [],
    faqItems: [],
  }
}

/**
 * Mapa Contacto — oculto editorialmente si mapBlock.enabled === false.
 * Sin mapBlock en documento → defaults estructurales; nunca fallback si está desactivado.
 */
function resolveContactPageMap({ mapBlock, mapSection, useLegacyMerge, legacyMap, siteMapsQuery }) {
  if (mapBlock?.enabled === false) {
    return null
  }
  if (mapSection) {
    return resolveContactMap(
      mapSection,
      useLegacyMerge ? legacyMap : CONTACT_UI_DEFAULTS.map,
      siteMapsQuery,
    )
  }
  return useLegacyMerge ? { ...legacyMap } : { ...CONTACT_UI_DEFAULTS.map }
}

function legacyDetailCardTitle(card, fallback) {
  if (typeof card === 'string') return card
  return card?.title ?? fallback
}

function legacyDetailCardEnabled(card) {
  if (typeof card === 'object' && card != null && card.enabled === false) return false
  return true
}

function resolveContactDetailsCard(remoteCard, legacyCard, fallback) {
  const legacyTitle = legacyDetailCardTitle(legacyCard, fallback)
  const legacyEnabled = legacyDetailCardEnabled(legacyCard)

  if (remoteCard == null) {
    return { enabled: legacyEnabled, title: legacyTitle || fallback }
  }

  return {
    enabled: remoteCard.enabled !== false,
    title: safeString(remoteCard.title) || legacyTitle || fallback,
  }
}

/** Sección lateral Datos de contacto — títulos y visibilidad desde contactPage.details. */
export function resolveContactPageDetails(remote = {}, legacy = CONTACT_UI_DEFAULTS.details) {
  const remoteCards = remote?.cards ?? {}
  const legacyCards = legacy?.cards ?? CONTACT_DETAIL_CARD_DEFAULTS
  const defaults = CONTACT_DETAIL_CARD_DEFAULTS

  return {
    title:
      safeString(remote?.title) ||
      safeString(legacy?.title) ||
      CONTACT_UI_DEFAULTS.details.title,
    description: safeString(remote?.description) ?? safeString(legacy?.description) ?? '',
    cards: {
      phone: resolveContactDetailsCard(remoteCards.phone, legacyCards.phone, defaults.phone.title),
      email: resolveContactDetailsCard(remoteCards.email, legacyCards.email, defaults.email.title),
      address: resolveContactDetailsCard(
        remoteCards.address,
        legacyCards.address,
        defaults.address.title,
      ),
      hours: resolveContactDetailsCard(remoteCards.hours, legacyCards.hours, defaults.hours.title),
    },
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
  const useLegacyMerge = options.useLegacyMerge === true
  const legacyContent = options.legacyContent ?? emptyContactPageContent()

  const heroSection = getActiveContactHeroSection(extensions)
  const richTextSection = getActiveRichTextSection(extensions)
  const faqSection = getActiveFaqSection(extensions)
  const mapBlock = findMapBlockRaw(options.blocks)
  const mapSection = getActivePageSection(extensions, 'mapSection')
  const ctaSection = extensions?.ctaSection

  const heroResolved = resolveContactHero(
    heroSection,
    useLegacyMerge ? legacyContent.hero : null,
  )

  const content = emptyContactPageContent()

  content.hero = {
    eyebrow: heroSection?.eyebrow ?? (useLegacyMerge ? legacyContent.hero?.eyebrow : '') ?? '',
    title: heroSection?.title ?? (useLegacyMerge ? legacyContent.hero?.title : '') ?? '',
    subtitle: heroSection?.subtitle ?? (useLegacyMerge ? legacyContent.hero?.subtitle : '') ?? '',
    imageAlt:
      heroResolved.alt ||
      (useLegacyMerge ? legacyContent.hero?.imageAlt : '') ||
      '',
  }

  const paragraphs = richTextSection?.paragraphs?.length
    ? richTextSection.paragraphs
    : useLegacyMerge
      ? (legacyContent.intro?.paragraphs ?? [])
      : []

  content.intro = {
    formHint: useLegacyMerge ? (legacyContent.intro?.formHint ?? '') : '',
    paragraphs,
  }

  content.faq = faqSection
    ? {
        eyebrow: faqSection.eyebrow || (useLegacyMerge ? legacyContent.faq?.eyebrow : '') || '',
        title: faqSection.title || (useLegacyMerge ? legacyContent.faq?.title : '') || '',
        description:
          faqSection.description ||
          (useLegacyMerge ? legacyContent.faq?.description : '') ||
          '',
      }
    : useLegacyMerge
      ? { ...legacyContent.faq }
      : { eyebrow: '', title: '', description: '' }

  content.faqItems = faqSection?.items?.length
    ? faqSection.items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      }))
    : useLegacyMerge
      ? [...(legacyContent.faqItems ?? [])]
      : []

  content.cta = resolveContactPageCta(
    ctaSection,
    useLegacyMerge ? legacyContent.cta : undefined,
  )

  content.details = resolveContactPageDetails(
    options.details,
    useLegacyMerge ? legacyContent.details : CONTACT_UI_DEFAULTS.details,
  )

  content.map = resolveContactPageMap({
    mapBlock,
    mapSection,
    useLegacyMerge,
    legacyMap: legacyContent.map,
    siteMapsQuery: options.siteMapsQuery,
  })

  content.form = resolveContactForm(
    options.form ?? (useLegacyMerge ? legacyContent.form : {}),
  )
  content.servicios = buildContactFormServiceOptions()

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

function mergeContactDocumentFields(legacyContent, remote = {}) {
  return {
    ...legacyContent,
    details: resolveContactPageDetails(remote.details, legacyContent.details),
    form: resolveContactForm(remote.form ?? legacyContent.form ?? {}),
    servicios: buildContactFormServiceOptions(),
  }
}

/** Campos de documento (form, details, servicios) — disponibles aunque blocks[] use ruta legacy. */
function applyRemoteFormAndServicios(legacyContent, remote = {}) {
  if (!remote?.form && remote?.details == null) {
    return legacyContent
  }
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

  const built = buildContactPageContentFromCms(resolved, {
    legacyContent: emptyContactPageContent(),
    useLegacyMerge: false,
    form: options.remote?.form,
    blocks: options.remote?.blocks,
    details: options.remote?.details,
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

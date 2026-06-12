/**
 * Contrato de dominio heroBlock → frontend.
 * Botones principales: siteSettings.serviceCta (useGlobalServiceCta).
 */

const DEFAULT_IMAGE = Object.freeze({ url: null, alt: '' })
const DEFAULT_TEXT_LINK = Object.freeze({ label: '', to: '/trabajos-realizados', ariaLabel: '' })

export function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function createEmptyHero(overrides = {}) {
  return {
    eyebrow: '',
    title: '',
    subtitle: '',
    highlights: [],
    textLink: { ...DEFAULT_TEXT_LINK },
    image: { ...DEFAULT_IMAGE },
    primaryImage: { ...DEFAULT_IMAGE },
    secondaryImage: { ...DEFAULT_IMAGE },
    ...overrides,
  }
}

function normalizeTextLink(raw, fallbackTo = '/trabajos-realizados') {
  if (raw == null || raw === false) {
    return { ...DEFAULT_TEXT_LINK, to: fallbackTo }
  }
  if (typeof raw === 'string') {
    const to = sanitizeString(raw) || fallbackTo
    return { label: '', to, ariaLabel: '' }
  }
  if (typeof raw !== 'object') {
    return { ...DEFAULT_TEXT_LINK, to: fallbackTo }
  }
  const label = sanitizeString(raw.label ?? raw.textLinkLabel)
  let to = sanitizeString(raw.to ?? raw.textLinkUrl ?? raw.path ?? raw.href)
  if (!to) to = fallbackTo
  const ariaLabel = sanitizeString(raw.ariaLabel) || label
  return { label, to, ariaLabel }
}

function pickTextLinkRaw(block) {
  if (block?.textLinkLabel || block?.textLinkUrl) {
    return { label: block.textLinkLabel, to: block.textLinkUrl }
  }
  if (block?.textLink) return block.textLink
  if (block?.secondaryLink) return block.secondaryLink
  if (block?.secondaryCta) return block.secondaryCta
  return null
}

function normalizeHighlights(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => sanitizeString(item)).filter(Boolean)
}

function normalizeHeroImage(imageField, imageAltFallback) {
  const url =
    imageField?.asset?.url ??
    imageField?.url ??
    (typeof imageField === 'string' ? imageField : null) ??
    null
  const alt = sanitizeString(imageField?.alt ?? imageAltFallback)
  return { url: url || null, alt }
}

/**
 * Normaliza documento/block hero al shape contractual.
 * @param {object | null | undefined} block
 */
export function normalizeHero(block) {
  if (!block) return createEmptyHero()

  const primaryImage = normalizeHeroImage(
    block.primaryImage ?? block.image,
    block.primaryImageAlt ?? block.imageAlt,
  )
  const secondaryImage = normalizeHeroImage(block.secondaryImage, block.secondaryImageAlt)

  return createEmptyHero({
    eyebrow: sanitizeString(block.eyebrow),
    title: sanitizeString(block.title),
    subtitle: sanitizeString(block.subtitle),
    highlights: normalizeHighlights(block.highlights),
    textLink: normalizeTextLink(pickTextLinkRaw(block), '/trabajos-realizados'),
    image: primaryImage,
    primaryImage,
    secondaryImage,
  })
}

function isValidCtaPath(path) {
  const value = sanitizeString(path)
  if (!value) return false
  return (
    value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('#')
  )
}

/**
 * @returns {{ valid: boolean, warnings: object[] }}
 */
export function validateHero(hero) {
  const warnings = []

  if (!sanitizeString(hero?.title)) {
    warnings.push({
      type: 'missing-title',
      block: 'heroBlock',
      field: 'title',
      message: 'missing title',
    })
  }

  if (!hero?.primaryImage?.url && !hero?.image?.url) {
    warnings.push({
      type: 'missing-image',
      block: 'heroBlock',
      field: 'primaryImage',
      message: 'missing primary image',
    })
  }

  const textPath = hero?.textLink?.to
  if (textPath && !isValidCtaPath(textPath)) {
    warnings.push({
      type: 'invalid-cta',
      block: 'heroBlock',
      field: 'textLink',
      path: textPath,
      message: 'invalid text link',
    })
  }

  const valid = warnings.every((w) => w.type !== 'missing-title')

  return { valid, warnings }
}

/** Hero activo para UI: requiere título. */
export function isHeroSectionActive(hero) {
  return validateHero(hero).valid
}

/**
 * Mapea heroBlock Sanity → contrato.
 * @param {object | null | undefined} block
 */
export function mapHeroBlockToContract(block) {
  if (!block) {
    return { hero: null, warnings: [], valid: false }
  }

  const hero = normalizeHero(block)
  const { valid, warnings } = validateHero(hero)

  return { hero, warnings, valid }
}

/** Espejo legacy homeContent.hero desde contrato. */
export function heroContractToLegacyMirror(hero) {
  if (!hero) return undefined
  return {
    title: hero.title,
    subtitle: '',
    highlights: [],
    secondaryLink: {
      label: hero.textLink.label,
      to: hero.textLink.to,
      ariaLabel: hero.textLink.ariaLabel,
    },
    imageAlt: hero.primaryImage?.alt || hero.image?.alt,
    primaryImageAlt: hero.primaryImage?.alt,
    secondaryImageAlt: hero.secondaryImage?.alt,
  }
}

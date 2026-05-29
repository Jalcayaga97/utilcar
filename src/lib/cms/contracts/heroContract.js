/**
 * Contrato de dominio heroBlock → frontend.
 */

const DEFAULT_CTA = Object.freeze({ label: '', to: '/contacto', ariaLabel: '' })
const DEFAULT_IMAGE = Object.freeze({ url: null, alt: '' })

export function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function createEmptyHero(overrides = {}) {
  return {
    title: '',
    subtitle: '',
    highlights: [],
    primaryCta: { ...DEFAULT_CTA },
    secondaryCta: { ...DEFAULT_CTA },
    image: { ...DEFAULT_IMAGE },
    ...overrides,
  }
}

function normalizeCta(raw, fallbackTo = '/contacto') {
  if (!raw || typeof raw !== 'object') {
    return createEmptyHero().primaryCta
  }
  const label = sanitizeString(raw.label)
  let to = sanitizeString(raw.to ?? raw.path ?? raw.href)
  if (!to) to = fallbackTo
  const ariaLabel = sanitizeString(raw.ariaLabel) || label
  return { label, to, ariaLabel }
}

function normalizeHighlights(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => sanitizeString(item)).filter(Boolean)
}

function normalizeHeroImage(imageField, imageAltFallback) {
  const url = imageField?.asset?.url ?? imageField?.url ?? null
  const alt = sanitizeString(imageField?.alt ?? imageAltFallback)
  return { url: url || null, alt }
}

function pickPrimaryCtaRaw(block) {
  if (block?.primaryCta) return block.primaryCta
  if (block?.primaryLink) return block.primaryLink
  if (block?.buttonLabel || block?.buttonLink) {
    return { label: block.buttonLabel, to: block.buttonLink }
  }
  return null
}

/**
 * Normaliza documento/block hero al shape contractual.
 * @param {object | null | undefined} block
 */
export function normalizeHero(block) {
  if (!block) return createEmptyHero()

  return createEmptyHero({
    title: sanitizeString(block.title),
    subtitle: sanitizeString(block.subtitle),
    highlights: normalizeHighlights(block.highlights),
    primaryCta: normalizeCta(pickPrimaryCtaRaw(block), '/contacto'),
    secondaryCta: normalizeCta(
      block.secondaryCta ?? block.secondaryLink,
      '/trabajos-realizados',
    ),
    image: normalizeHeroImage(block.image, block.imageAlt),
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

  if (!hero?.image?.url) {
    warnings.push({
      type: 'missing-image',
      block: 'heroBlock',
      field: 'image',
      message: 'missing image',
    })
  }

  for (const [field, cta] of [
    ['primaryCta', hero?.primaryCta],
    ['secondaryCta', hero?.secondaryCta],
  ]) {
    const path = cta?.to
    if (path && !isValidCtaPath(path)) {
      warnings.push({
        type: 'invalid-cta',
        block: 'heroBlock',
        field,
        path,
        message: 'invalid cta',
      })
    }
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
    subtitle: hero.subtitle,
    highlights: hero.highlights,
    secondaryLink: {
      label: hero.secondaryCta.label,
      to: hero.secondaryCta.to,
      ariaLabel: hero.secondaryCta.ariaLabel,
    },
    imageAlt: hero.image.alt,
  }
}

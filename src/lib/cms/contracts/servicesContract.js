/**
 * Contrato de dominio servicesBlock → frontend (Home, Servicios, futuras secciones).
 * Fuente única de normalización/validación antes de conectar UI.
 */

const DEFAULT_LINK = Object.freeze({ label: '', path: '/servicios' })
const DEFAULT_IMAGE = Object.freeze({ url: null, alt: '' })

export function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

/** Item contractual normalizado (servicesBlock → UI). */
export function createEmptyServiceItem(overrides = {}) {
  return {
    id: '',
    title: '',
    description: '',
    icon: null,
    link: { ...DEFAULT_LINK },
    image: { ...DEFAULT_IMAGE },
    featured: false,
    tags: [],
    ...overrides,
  }
}

function stableServiceId(raw, index) {
  const key = sanitizeString(raw?._key)
  if (key) return key
  const explicit = sanitizeString(raw?.id)
  if (explicit) return explicit
  return `service-${index}`
}

function normalizeLink(raw) {
  const label = sanitizeString(raw?.label)
  let path = sanitizeString(raw?.path ?? raw?.to)
  if (!path) path = DEFAULT_LINK.path
  return { label, path }
}

function normalizeImage(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_IMAGE }
  const url = raw?.asset?.url ?? raw?.url ?? null
  return {
    url: url || null,
    alt: sanitizeString(raw?.alt),
  }
}

function normalizeTags(raw) {
  if (!Array.isArray(raw)) return []
  return raw.map((tag) => sanitizeString(tag)).filter(Boolean)
}

/**
 * Normaliza un ítem Sanity/local al shape contractual.
 * @param {object} raw
 * @param {{ index?: number }} [context]
 */
export function normalizeServiceItem(raw, context = {}) {
  const index = context.index ?? 0
  return createEmptyServiceItem({
    id: stableServiceId(raw, index),
    title: sanitizeString(raw?.title),
    description: sanitizeString(raw?.description),
    icon: sanitizeString(raw?.icon) || null,
    link: normalizeLink(raw?.link),
    image: normalizeImage(raw?.image),
    featured: Boolean(raw?.featured),
    tags: normalizeTags(raw?.tags),
  })
}

/**
 * @returns {{ valid: boolean, warnings: object[] }}
 */
export function validateServiceItem(item, context = {}) {
  const warnings = []
  const index = context.index ?? 0
  const id = item?.id ?? `service-${index}`

  if (!sanitizeString(item?.title)) {
    warnings.push({
      type: 'missing-title',
      block: 'servicesBlock',
      field: 'items',
      index,
      id,
      message: 'missing title',
    })
  }

  if (!sanitizeString(item?.description)) {
    warnings.push({
      type: 'missing-description',
      block: 'servicesBlock',
      field: 'items',
      index,
      id,
      message: 'missing description',
    })
  }

  const path = sanitizeString(item?.link?.path)
  if (path && !path.startsWith('/')) {
    warnings.push({
      type: 'invalid-link',
      block: 'servicesBlock',
      field: 'items',
      index,
      id,
      path,
      message: 'invalid links',
    })
  }

  const valid =
    warnings.filter((w) => w.type === 'missing-title' || w.type === 'missing-description')
      .length === 0

  return { valid, warnings }
}

/** Ítems listos para UI: título y descripción requeridos. */
export function getValidServiceItems(items) {
  if (!Array.isArray(items)) return []
  return items.filter((item) => validateServiceItem(item).valid)
}

function collectDuplicateIdWarnings(items) {
  const warnings = []
  const seen = new Map()

  for (const item of items) {
    const id = item?.id
    if (!id) continue
    if (seen.has(id)) {
      warnings.push({
        type: 'duplicate-id',
        block: 'servicesBlock',
        field: 'items',
        id,
        message: 'duplicate ids',
      })
    } else {
      seen.set(id, true)
    }
  }

  return warnings
}

/**
 * Mapea servicesBlock Sanity → sección contractual.
 * @param {object | null | undefined} block
 * @returns {{ section: object | null, warnings: object[], validItems: object[] }}
 */
export function mapServiceBlockToContract(block) {
  if (!block) {
    return { section: null, warnings: [], validItems: [] }
  }

  const section = {
    eyebrow: sanitizeString(block.eyebrow),
    title: sanitizeString(block.title),
    description: sanitizeString(block.description),
    cardLinkLabel: sanitizeString(block.cardLinkLabel),
    items: (block.items ?? []).map((raw, index) => normalizeServiceItem(raw, { index })),
  }

  const itemWarnings = section.items.flatMap((item, index) =>
    validateServiceItem(item, { index }).warnings,
  )
  const duplicateWarnings = collectDuplicateIdWarnings(section.items)
  const warnings = [...itemWarnings, ...duplicateWarnings]
  const validItems = getValidServiceItems(section.items)

  return { section, warnings, validItems }
}

/** Shape legacy para adapters existentes (servicesItems deprecated). */
export function contractItemToLegacyAdapter(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    path: item.link?.path ?? DEFAULT_LINK.path,
    imageAlt: item.image?.alt ?? '',
    icon: item.icon,
  }
}

/**
 * Puente contractual → tarjetas MainServices.
 * CMS-first: icono/imagen desde el ítem contractual.
 * @param {object[]} contractItems — ítems ya validados
 * @param {string} defaultCardLinkLabel
 * @param {object[] | null} [legacyServices] — solo fallback de emergencia (resolver OFF)
 */
export function mapContractItemsForMainServices(
  contractItems,
  defaultCardLinkLabel,
  legacyServices = null,
) {
  if (!contractItems?.length) return []

  const legacyByPath =
    legacyServices?.length > 0
      ? new Map(legacyServices.map((service) => [service.path, service]))
      : null

  return contractItems.map((item) => {
    const legacy = legacyByPath?.get(item.link?.path)
    const cardLinkLabel = sanitizeString(item.link?.label) || defaultCardLinkLabel
    const cmsImageUrl = item.image?.url || null

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      path: item.link?.path ?? DEFAULT_LINK.path,
      imageAlt: item.image?.alt || item.title,
      icon: item.icon,
      imageUrl: cmsImageUrl ?? legacy?.imageUrl ?? null,
      cardLinkLabel,
      _source: cmsImageUrl ? 'cms' : legacy?.imageUrl ? 'legacy-emergency' : 'none',
    }
  })
}

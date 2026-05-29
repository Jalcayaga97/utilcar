/**
 * Identidad canónica para merge determinístico legacy ↔ specialtiesNew.
 */

function isCmsDev() {
  return Boolean(import.meta.env?.DEV)
}

function devWarn(message, detail) {
  if (!isCmsDev()) return
  console.warn(`[cms:normalize] ${message}`, detail ?? '')
}

/**
 * Hash estable a partir del título (fallback de identidad).
 */
export function hashTitle(title) {
  const s = String(title ?? '')
    .trim()
    .toLowerCase()
  if (!s) return ''

  let h = 5381
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return `hash-${(h >>> 0).toString(36)}`
}

/**
 * Resuelve identidad única: blockKey → id → slug → hash(title).
 */
export function getCanonicalId(item) {
  if (item == null || typeof item !== 'object') return ''

  const blockKey = item.blockMeta?.blockKey?.trim?.() ?? item.blockMeta?.blockKey
  if (blockKey) return String(blockKey).trim()

  const id = item.id?.trim?.() ?? item.id
  if (id) return String(id).trim()

  const slug = item.slug?.trim?.() ?? item.slug
  if (slug) return String(slug).trim()

  if (item.canonicalId?.trim?.()) return item.canonicalId.trim()

  return hashTitle(item.title)
}

/**
 * Normaliza un ítem (legacy o new) con identidad canónica estable.
 */
export function normalizeSpecialty(item) {
  if (item == null || typeof item !== 'object') return null

  const canonicalId = getCanonicalId(item)
  if (!canonicalId) return null

  const blockType =
    item.blockMeta?.blockType ??
    (item.description !== undefined || item.features !== undefined ? 'specialty' : 'especialidadItem')

  return {
    ...item,
    id: canonicalId,
    canonicalId,
    blockMeta: {
      ...(item.blockMeta ?? {}),
      blockKey: canonicalId,
      blockType,
    },
  }
}

function warnIdentityIssues(item, source, index) {
  const hasId = Boolean(item?.id?.trim?.() ?? item?.id)
  const hasBlockKey = Boolean(item?.blockMeta?.blockKey?.trim?.() ?? item?.blockMeta?.blockKey)

  if (!hasId) {
    devWarn(`item sin id (${source}[${index}])`, { title: item?.title })
  }
  if (source === 'new' && !hasBlockKey) {
    devWarn(`item sin blockKey (${source}[${index}]) — se normaliza desde id/slug/título`, {
      title: item?.title,
    })
  }
}

/**
 * Normaliza lista completa con deduplicación y warnings en dev.
 */
export function normalizeSpecialtyList(items, source = 'specialty') {
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  const seen = new Map()
  const normalized = []

  list.forEach((item, index) => {
    warnIdentityIssues(item, source, index)

    const norm = normalizeSpecialty(item)
    if (!norm) {
      devWarn(`item sin identidad resoluble (${source}[${index}])`, item)
      return
    }

    if (seen.has(norm.canonicalId)) {
      devWarn(`canonicalId duplicado omitido (${source})`, {
        canonicalId: norm.canonicalId,
        title: norm.title,
      })
      return
    }

    seen.set(norm.canonicalId, true)
    normalized.push(norm)
  })

  return normalized
}

/**
 * Contrato legacy para downstream (id estable; metadatos internos omitidos).
 */
export function toLegacySpecialtyContract(item) {
  if (!item) return item
  const rest = { ...item }
  delete rest.blockMeta
  delete rest.canonicalId
  return {
    ...rest,
    id: item.canonicalId ?? rest.id,
  }
}

export function toLegacySpecialtyList(items) {
  return (items ?? []).map(toLegacySpecialtyContract)
}

import { USE_NEW_SPECIALTIES } from '@/lib/cms/config'
import {
  normalizeSpecialty,
  normalizeSpecialtyList,
  toLegacySpecialtyList,
} from '@/lib/cms/normalize'

/**
 * Mapea specialty modular normalizado → contrato legacy.
 */
function mapSpecialtyNewToLegacy(item) {
  if (!item?.title?.trim()) return null

  const normalized = normalizeSpecialty(item)
  if (!normalized) return null

  return {
    id: normalized.canonicalId,
    canonicalId: normalized.canonicalId,
    title: normalized.title.trim(),
    subtitle: normalized.subtitle?.trim() ?? '',
    intro: normalized.description?.trim() ?? normalized.intro?.trim() ?? '',
    specGroups: normalized.features?.length
      ? [{ title: 'Características', items: normalized.features.filter(Boolean) }]
      : (normalized.specGroups ?? []),
    cta: {
      label: normalized.buttonText?.trim() ?? normalized.cta?.label ?? '',
      path: normalized.buttonLink?.trim() ?? normalized.cta?.path ?? '',
    },
    imageAlt: normalized.imageAlt?.trim() ?? '',
  }
}

function mergeItemSafe(legacyItem, newItem) {
  if (!legacyItem) return newItem
  if (!newItem?.title?.trim()) return legacyItem

  return {
    ...legacyItem,
    title: newItem.title || legacyItem.title,
    subtitle: newItem.subtitle || legacyItem.subtitle,
    intro: newItem.intro || legacyItem.intro,
    specGroups: newItem.specGroups?.length ? newItem.specGroups : legacyItem.specGroups,
    cta: newItem.cta?.label ? newItem.cta : legacyItem.cta,
    imageAlt: newItem.imageAlt || legacyItem.imageAlt,
  }
}

/**
 * Merge determinístico solo por canonicalId.
 * Orden: legacy base → match new → unmatched new al final.
 */
function mergeSpecialtiesSafe(legacyNorm, newNorm) {
  if (!legacyNorm.length) return newNorm
  if (!newNorm.length) return legacyNorm

  const newByCanonical = new Map(
    newNorm.filter((n) => n.canonicalId).map((n) => [n.canonicalId, n]),
  )
  const usedCanonical = new Set()

  const merged = legacyNorm.map((legacyItem) => {
    const candidate = newByCanonical.get(legacyItem.canonicalId)
    if (!candidate) return legacyItem

    usedCanonical.add(candidate.canonicalId)
    return mergeItemSafe(legacyItem, candidate)
  })

  for (const newItem of newNorm) {
    if (!newItem.canonicalId || usedCanonical.has(newItem.canonicalId)) continue
    merged.push(newItem)
  }

  return merged.length ? merged : legacyNorm
}

function finalizeSpecialties(result, legacyFallback) {
  if (Array.isArray(result) && result.length > 0) return result
  if (legacyFallback?.length) return legacyFallback
  return null
}

/**
 * Selecciona fuente activa según flag y aplica merge seguro legacy ↔ nuevo.
 *
 * @param {{ legacy?: array, specialtiesNew?: array, useNew?: boolean }} params
 * @returns {array|null} Contrato legacy listo para mergeEspecialidades; null → fallback /content
 */
export function getActiveSpecialties({
  legacy = [],
  specialtiesNew = [],
  useNew = USE_NEW_SPECIALTIES,
} = {}) {
  const normalizedLegacy = normalizeSpecialtyList(legacy, 'legacy')

  if (!useNew) {
    return finalizeSpecialties(toLegacySpecialtyList(normalizedLegacy), normalizedLegacy)
  }

  const normalizedNewRaw = normalizeSpecialtyList(specialtiesNew, 'new')
  const mappedNew = normalizedNewRaw.map(mapSpecialtyNewToLegacy).filter(Boolean)

  const normalizedNew = normalizeSpecialtyList(mappedNew, 'new-mapped')

  if (!normalizedNew.length) {
    return finalizeSpecialties(toLegacySpecialtyList(normalizedLegacy), normalizedLegacy)
  }

  const merged = mergeSpecialtiesSafe(normalizedLegacy, normalizedNew)
  return finalizeSpecialties(toLegacySpecialtyList(merged), normalizedLegacy)
}

export { mapSpecialtyNewToLegacy, mergeSpecialtiesSafe }

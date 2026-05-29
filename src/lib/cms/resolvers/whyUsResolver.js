import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'whyUsBlock'
export const REQUIRED_FIELDS = ['title']

export function findWhyUsBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

/** Metadatos de sección (shape highlights legacy en homeContent). */
export function resolveWhyUsMirror(block) {
  if (!block) return undefined
  const mirror = {
    eyebrow: block.eyebrow,
    title: block.title,
  }
  logResolverDomain('whyUs', {
    resolved: Boolean(block.title),
    itemCount: block.items?.length ?? 0,
  })
  return mirror
}

function pickWhyUsSectionMeta(block) {
  if (!block) return undefined
  return {
    eyebrow: block.eyebrow,
    title: block.title,
    description: block.description ?? '',
  }
}

function mapWhyUsItems(block) {
  if (!block?.items?.length) return []
  return block.items.map((item, index) => ({
    title: item?.title ?? '',
    description: item?.description ?? '',
    icon: item?.icon ?? null,
    _key: item?._key ?? `why-us-${index}`,
  }))
}

/** Fuente editorial completa: metadata + items desde whyUsBlock. */
export function buildWhyUsSection(block) {
  if (!block) return null
  const meta = pickWhyUsSectionMeta(block)
  if (!meta) return null
  const section = {
    ...meta,
    items: mapWhyUsItems(block),
  }
  logResolverDomain('whyUs', {
    extension: 'whyUsSection',
    itemCount: section.items.length,
    validItemCount: getValidWhyUsItems(section.items).length,
  })
  return section
}

/** Ítems con título y descripción editorial mínimos. */
export function getValidWhyUsItems(items) {
  if (!Array.isArray(items)) return []
  return items.filter(
    (item) =>
      String(item?.title ?? '').trim().length > 0 &&
      String(item?.description ?? '').trim().length > 0,
  )
}

/**
 * Sección whyUs activa (metadata + cards) cuando el resolver está ON y hay ítems válidos.
 * @returns {object | null}
 */
export function getActiveWhyUsSection(extensions) {
  if (!USE_BLOCK_RESOLVER) return null
  const section = extensions?.whyUsSection
  if (!section) return null

  const items = getValidWhyUsItems(section.items)
  if (!items.length) return null

  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    items,
  }
}

export function collectWhyUsWarnings(blocks) {
  const warnings = []
  const block = findWhyUsBlock(blocks)
  if (!block) {
    warnings.push(missingBlockWarning(BLOCK_TYPE))
    return warnings
  }
  if (block.enabled === false) return warnings

  for (const field of REQUIRED_FIELDS) {
    if (isEmptyField(block[field])) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, field))
    }
  }
  return warnings
}

export function emptyWhyUsSectionExtension() {
  return null
}

/** @deprecated Usar whyUsSection; se mantiene por compatibilidad interna. */
export function emptyWhyUsExtension() {
  return []
}

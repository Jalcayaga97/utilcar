import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import {
  findPortfolioBlock,
  isEmptyField,
  missingBlockWarning,
  missingFieldWarning,
} from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'portfolioBlock'
export const REQUIRED_FIELDS = ['title']

export function findPortfolioBlockInList(blocks) {
  return findPortfolioBlock(blocks)
}

/** Metadatos de sección (shape portfolioPreview legacy). */
export function resolvePortfolioMirror(block) {
  if (!block) return undefined
  const mirror = {
    eyebrow: block.eyebrow,
    title: block.title,
    description: block.description,
    ctaLabel: block.ctaLabel,
    ctaTo: block.ctaTo,
    previewCount: block.previewCount ?? 3,
  }
  logResolverDomain('portfolio', {
    resolved: Boolean(block.title),
    itemCount: block.items?.length ?? 0,
    previewCount: mirror.previewCount,
  })
  return mirror
}

function mapPortfolioItems(block) {
  if (!block?.items?.length) return []
  return block.items.map((item, index) => ({
    id: item?._key || `portfolio-${index}`,
    title: item?.title ?? '',
    subtitle: item?.subtitle ?? '',
    description: item?.description ?? '',
    category: item?.subtitle ?? '',
    categoryId: item?._key ?? `cat-${index}`,
    imageAlt: item?.image?.alt ?? item?.title ?? '',
    imageKey: null,
    imageUrl: item?.image?.asset?.url ?? null,
    image: item?.image ?? null,
  }))
}

/** Fuente editorial completa: metadata + items desde portfolioBlock. */
export function resolvePortfolioSection(block) {
  if (!block) return null
  const meta = resolvePortfolioMirror(block)
  if (!meta) return null
  const section = {
    ...meta,
    items: mapPortfolioItems(block),
  }
  logResolverDomain('portfolio', {
    extension: 'portfolioSection',
    itemCount: section.items.length,
    validItemCount: getValidPortfolioItems(section.items).length,
  })
  return section
}

/** Ítems con título editorial mínimo para la sección Trabajos recientes. */
export function getValidPortfolioItems(items) {
  if (!Array.isArray(items)) return []
  return items.filter((item) => String(item?.title ?? '').trim().length > 0)
}

/**
 * Sección portfolio activa (metadata + cards) cuando el resolver está ON y hay ítems válidos.
 * @returns {object | null}
 */
export function getActivePortfolioSection(extensions) {
  if (!USE_BLOCK_RESOLVER) return null
  const section = extensions?.portfolioSection
  if (!section) return null

  const items = getValidPortfolioItems(section.items)
  if (!items.length) return null

  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    ctaLabel: section.ctaLabel ?? '',
    ctaTo: section.ctaTo ?? '',
    previewCount: section.previewCount ?? 3,
    items,
  }
}

export function collectPortfolioWarnings(blocks) {
  const warnings = []
  const block = findPortfolioBlock(blocks)
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

export function emptyPortfolioExtension() {
  return null
}

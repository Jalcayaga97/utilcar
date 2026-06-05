import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import { resolveHomePortfolioDisplay } from '@/lib/cms/resolvers/workProjectsResolver'
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

function mapFeaturedProjectIds(block) {
  return (block?.featuredProjects ?? [])
    .map((ref) => {
      const fromRef = ref?.project?.id ?? ref?.project?.projectId?.current
      return String(fromRef ?? ref?.projectId ?? '').trim()
    })
    .filter(Boolean)
}

function mapSelectedProjectsRaw(block) {
  return Array.isArray(block?.selectedProjects) ? block.selectedProjects : []
}

/** Fuente editorial completa: metadata + items o referencias a workPage. */
export function resolvePortfolioSection(block) {
  if (!block) return null
  const meta = resolvePortfolioMirror(block)
  if (!meta) return null
  const featuredProjectIds = mapFeaturedProjectIds(block)
  const selectedProjects = mapSelectedProjectsRaw(block)
  const section = {
    ...meta,
    items: mapPortfolioItems(block),
    featuredProjectIds,
    featuredProjects: block?.featuredProjects ?? [],
    selectedProjects,
  }
  logResolverDomain('portfolio', {
    extension: 'portfolioSection',
    itemCount: section.items.length,
    featuredCount: featuredProjectIds.length,
    selectedCount: selectedProjects.length,
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
 * Vista previa Home — selectedProjects → featuredProjects (legacy) → featured/homeVisible.
 */
export function resolveHomePortfolioCards(
  portfolioSection,
  projectCatalog,
  previewCount = 3,
) {
  const { projects } = resolveHomePortfolioDisplay(portfolioSection, projectCatalog, {
    limit: previewCount,
  })
  return projects
}

/**
 * Sección portfolio activa cuando el resolver está ON y el bloque tiene título.
 * @returns {object | null}
 */
export function getActivePortfolioSection(extensions) {
  if (!USE_BLOCK_RESOLVER) return null
  const section = extensions?.portfolioSection
  if (!section) return null
  if (!String(section.title ?? '').trim()) return null

  const featuredProjectIds = section.featuredProjectIds ?? []
  const items = getValidPortfolioItems(section.items ?? [])

  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    ctaLabel: section.ctaLabel ?? '',
    ctaTo: section.ctaTo ?? '',
    previewCount: section.previewCount ?? 3,
    items,
    featuredProjectIds,
    featuredProjects: section.featuredProjects ?? [],
    selectedProjects: section.selectedProjects ?? [],
    autoRecent: false,
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

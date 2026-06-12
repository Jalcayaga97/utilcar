import { resolveCmsIcon } from '@/lib/cms/icons/resolveCmsIcon'
import { featureGridSectionContract } from '@/lib/cms/contracts/featureGridBlockContract'
import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'featureGridBlock'
export const REQUIRED_FIELDS = ['title']

export function findFeatureGridBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

function mapFeatureGridItems(block) {
  if (!block?.items?.length) return []
  return block.items.map((item, index) => ({
    title: item?.title ?? '',
    description: item?.description ?? '',
    icon: resolveCmsIcon(item?.icon),
    _key: item?._key ?? `feature-grid-${index}`,
  }))
}

export function buildFeatureGridSection(block) {
  if (!block) return null
  const meta = featureGridSectionContract(block)
  if (!meta?.title && !meta?.items?.length) return null
  const section = {
    ...meta,
    items: mapFeatureGridItems(block),
  }
  logResolverDomain('featureGrid', {
    itemCount: section.items.length,
    validItemCount: getValidFeatureGridItems(section.items).length,
  })
  return section
}

export function getValidFeatureGridItems(items) {
  if (!Array.isArray(items)) return []
  return items.filter(
    (item) =>
      String(item?.title ?? '').trim().length > 0 &&
      String(item?.description ?? '').trim().length > 0,
  )
}

export function getActiveFeatureGridSection(extensions) {
  const section = extensions?.featureGridSection
  if (!section) return null
  const items = getValidFeatureGridItems(section.items)
  if (!items.length) return null
  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    items,
  }
}

export function collectFeatureGridWarnings(blocks) {
  const warnings = []
  const block = findFeatureGridBlock(blocks)
  if (!block) return warnings
  if (block.enabled === false) return warnings

  for (const field of REQUIRED_FIELDS) {
    if (isEmptyField(block[field])) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, field))
    }
  }
  if (!block.items?.length) {
    warnings.push(missingBlockWarning(`${BLOCK_TYPE}:items`))
  }
  return warnings
}

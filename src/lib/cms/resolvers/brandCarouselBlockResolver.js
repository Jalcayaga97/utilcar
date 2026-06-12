import {
  brandCarouselSectionContract,
  mapBrandCarouselBrands,
} from '@/lib/cms/contracts/brandCarouselBlockContract'
import { findBlock, isEmptyField, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'brandCarouselBlock'

export function findBrandCarouselBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildBrandCarouselSection(block) {
  if (!block) return null
  const section = brandCarouselSectionContract(block)
  const brands = mapBrandCarouselBrands(section?.brands)
  if (!brands.length) return null
  logResolverDomain('brandCarousel', { brandCount: brands.length })
  return {
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    brands,
  }
}

export function getActiveBrandCarouselSection(extensions) {
  const section = extensions?.brandCarouselSection
  if (!section) return null
  const brands = (section.brands ?? []).filter(
    (brand) => String(brand?.src ?? '').trim() && String(brand?.name ?? '').trim(),
  )
  if (!brands.length) return null
  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    brands,
  }
}

export function collectBrandCarouselWarnings(blocks) {
  const warnings = []
  const block = findBrandCarouselBlock(blocks)
  if (!block || block.enabled === false) return warnings
  if (!block.brands?.length) {
    warnings.push(`${BLOCK_TYPE}:empty-brands`)
  }
  for (const [index, item] of (block.brands ?? []).entries()) {
    if (item?.active === false) continue
    if (isEmptyField(item?.name)) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, `brands[${index}].name`))
    }
    if (!item?.logo?.asset && !item?.logo?.url) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, `brands[${index}].logo`))
    }
  }
  return warnings
}

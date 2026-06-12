import {
  mapShowcaseCarouselImages,
  showcaseCarouselSectionContract,
} from '@/lib/cms/contracts/showcaseCarouselBlockContract'
import { findBlock, isEmptyField, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'showcaseCarouselBlock'

export function findShowcaseCarouselBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildShowcaseCarouselSection(block) {
  if (!block) return null
  const section = showcaseCarouselSectionContract(block)
  const images = mapShowcaseCarouselImages(section?.images)
  if (!images.length) return null
  logResolverDomain('showcaseCarousel', { imageCount: images.length })
  return {
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    images,
  }
}

export function getActiveShowcaseCarouselSection(extensions) {
  const section = extensions?.showcaseCarouselSection
  if (!section) return null
  const images = (section.images ?? []).filter(
    (img) => String(img?.src ?? '').trim() && String(img?.alt ?? '').trim(),
  )
  if (!images.length) return null
  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    images,
  }
}

export function collectShowcaseCarouselWarnings(blocks) {
  const warnings = []
  const block = findShowcaseCarouselBlock(blocks)
  if (!block || block.enabled === false) return warnings
  if (!block.images?.length) {
    warnings.push(`${BLOCK_TYPE}:empty-images`)
  }
  for (const [index, item] of (block.images ?? []).entries()) {
    if (isEmptyField(item?.alt)) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, `images[${index}].alt`))
    }
  }
  return warnings
}

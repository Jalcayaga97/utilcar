import { findBlock } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'mapBlock'

export function findMapBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildMapSection(block) {
  if (!block) return null
  const section = {
    enabled: block.enabled !== false,
    eyebrow: block.eyebrow ?? '',
    title: block.title ?? '',
    embedQuery: block.embedQuery ?? '',
    iframeTitle: block.iframeTitle ?? '',
  }
  logResolverDomain('map', { extension: 'mapSection', hasQuery: Boolean(section.embedQuery) })
  return section
}

export function collectMapWarnings(blocks) {
  const block = findMapBlock(blocks)
  if (!block) return []
  return []
}

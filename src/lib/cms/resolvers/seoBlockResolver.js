import { findBlock } from './blockUtils'
import { mapSeoBlockToContract } from '@/lib/cms/contracts/seoBlockContract'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'seoBlock'

export function findSeoBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildSeoSection(block) {
  if (!block) return null
  const { section, warnings } = mapSeoBlockToContract(block)
  if (!section) return null

  logResolverDomain('seo', { title: section.title, warningCount: warnings.length })
  return section
}

export function collectSeoWarnings(blocks) {
  const block = findSeoBlock(blocks)
  if (!block) return []
  if (!block.title) return [`${BLOCK_TYPE}:missing-title`]
  return []
}

export function getActiveSeoSection(extensions) {
  const section = extensions?.seoSection
  if (!section?.title && !section?.description) return null
  return section
}

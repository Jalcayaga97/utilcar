import { findBlock, missingBlockWarning } from './blockUtils'
import { mapFaqBlockToContract } from '@/lib/cms/contracts/faqBlockContract'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'faqBlock'

export function findFaqBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildFaqSection(block) {
  if (!block) return null
  const { section, warnings } = mapFaqBlockToContract(block)
  if (!section?.items?.length) return null

  logResolverDomain('faq', { itemCount: section.items.length })
  if (warnings.length) logResolverDomain('faq', { contractWarnings: warnings })

  return section
}

export function collectFaqWarnings(blocks) {
  const block = findFaqBlock(blocks)
  if (!block) return []
  if (!block.items?.length) return [missingBlockWarning(BLOCK_TYPE, 'items')]
  return []
}

export function getActiveFaqSection(extensions) {
  const section = extensions?.faqSection
  if (!section?.items?.length) return null
  return section
}

import { findBlock, missingBlockWarning } from './blockUtils'
import { mapFeaturesBlockToContract } from '@/lib/cms/contracts/featuresBlockContract'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'featuresBlock'

export function findFeaturesBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function buildFeaturesSection(block) {
  if (!block) return null
  const { section, warnings } = mapFeaturesBlockToContract(block)
  if (!section) return null

  logResolverDomain('features', { groupCount: section.groups.length })
  if (warnings.length) logResolverDomain('features', { contractWarnings: warnings })

  return section
}

export function collectFeaturesWarnings(blocks) {
  const block = findFeaturesBlock(blocks)
  if (!block) return []
  if (!block.groups?.length) return [missingBlockWarning(BLOCK_TYPE, 'groups')]
  return []
}

export function getActiveFeaturesSection(extensions) {
  const section = extensions?.featuresSection
  if (!section?.groups?.length) return null
  return section
}

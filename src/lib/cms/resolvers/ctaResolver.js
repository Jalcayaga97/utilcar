import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'ctaBlock'
export const REQUIRED_FIELDS = ['title']

export function findCtaBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function resolveCtaMirror(block) {
  if (!block) return undefined
  const mirror = {
    title: block.title,
    description: block.description,
    primaryLabel: block.buttonLabel || block.buttonText || block.primaryLabel || '',
    primaryTo: block.buttonLink || block.primaryTo || '',
  }
  logResolverDomain('cta', { resolved: Boolean(block.title), hasLink: Boolean(mirror.primaryTo) })
  return mirror
}

export function collectCtaWarnings(blocks) {
  const warnings = []
  const block = findCtaBlock(blocks)
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

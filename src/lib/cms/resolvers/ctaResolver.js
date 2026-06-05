import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'ctaBlock'
export const REQUIRED_FIELDS = ['title']

export function findCtaBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

/** Metadatos CTA — título, descripción y botones opcionales (Página Trabajos). */
export function buildCtaSection(block) {
  if (!block) return null
  const section = {
    title: block.title ?? '',
    description: block.description ?? '',
    primaryLabel: block.primaryLabel ?? block.buttonLabel ?? block.buttonText ?? '',
    primaryTo: block.primaryTo ?? block.buttonLink ?? '',
  }
  const hasContent =
    Boolean(String(section.title).trim()) ||
    Boolean(String(section.description).trim()) ||
    Boolean(String(section.primaryLabel).trim())
  if (!hasContent) return null
  logResolverDomain('cta', { resolved: Boolean(section.title) })
  return section
}

/** Metadatos CTA Home — solo título y descripción (botones: siteSettings.serviceCta). */
export function resolveCtaMirror(block) {
  if (!block) return undefined
  const mirror = {
    title: block.title,
    description: block.description,
  }
  logResolverDomain('cta', { resolved: Boolean(block.title) })
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

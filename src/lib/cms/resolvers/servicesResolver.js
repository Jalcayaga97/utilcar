import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import {
  contractItemToLegacyAdapter,
  getValidServiceItems,
  mapServiceBlockToContract,
  sanitizeString,
} from '@/lib/cms/contracts/servicesContract'
import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'servicesBlock'
export const REQUIRED_FIELDS = ['title']

export function findServicesBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

/** Metadatos legacy (homeContent.services). */
export function resolveServicesMirror(block) {
  if (!block) return undefined
  const mirror = {
    eyebrow: sanitizeString(block.eyebrow),
    title: sanitizeString(block.title),
    description: sanitizeString(block.description),
    cardLinkLabel: sanitizeString(block.cardLinkLabel),
  }
  logResolverDomain('services', {
    resolved: Boolean(mirror.title),
    itemCount: block.items?.length ?? 0,
  })
  return mirror
}

/** Sección contractual completa desde servicesBlock (sin raw items). */
export function buildServicesSection(block) {
  if (!block) return null

  const { section, warnings, validItems } = mapServiceBlockToContract(block)
  if (!section) return null

  logResolverDomain('services', {
    extension: 'servicesSection',
    itemCount: section.items.length,
    validItemCount: validItems.length,
  })

  if (warnings.length > 0) {
    logResolverDomain('services', { contractWarnings: warnings })
  }

  return section
}

/**
 * Sección activa cuando el resolver está ON y hay ítems válidos (preparado para migración UI).
 * @returns {object | null}
 */
export function getActiveServicesSection(extensions) {
  if (!USE_BLOCK_RESOLVER) return null
  const section = extensions?.servicesSection
  if (!section) return null

  const items = getValidServiceItems(section.items)
  if (!items.length) return null

  return {
    eyebrow: section.eyebrow ?? '',
    title: section.title ?? '',
    description: section.description ?? '',
    cardLinkLabel: section.cardLinkLabel ?? '',
    items,
  }
}

/** @deprecated Usar servicesSection; shape legacy para adapters. */
export function resolveServicesItemsFromSection(section) {
  if (!section?.items?.length) return []
  return section.items.map(contractItemToLegacyAdapter)
}

export function resolveServicesItems(block) {
  const section = buildServicesSection(block)
  return resolveServicesItemsFromSection(section)
}

export function collectServicesWarnings(blocks) {
  const warnings = []
  const block = findServicesBlock(blocks)
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

  const { warnings: contractWarnings } = mapServiceBlockToContract(block)
  warnings.push(...contractWarnings)

  return warnings
}

export function emptyServicesSectionExtension() {
  return null
}

/** @deprecated Usar servicesSection. */
export function emptyServicesExtension() {
  return []
}

export { getValidServiceItems } from '@/lib/cms/contracts/servicesContract'

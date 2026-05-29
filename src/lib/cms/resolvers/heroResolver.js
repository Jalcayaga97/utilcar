import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import {
  heroContractToLegacyMirror,
  isHeroSectionActive,
  mapHeroBlockToContract,
} from '@/lib/cms/contracts/heroContract'
import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'heroBlock'
export const REQUIRED_FIELDS = ['title']

export function findHeroBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

export function resolveHeroMirror(block) {
  if (!block) return undefined
  const { hero } = mapHeroBlockToContract(block)
  const mirror = heroContractToLegacyMirror(hero)
  logResolverDomain('hero', {
    resolved: Boolean(mirror?.title),
    hasHighlights: Boolean(mirror?.highlights?.length),
    hasCmsImage: Boolean(hero?.image?.url),
  })
  return mirror
}

/** Sección contractual completa desde heroBlock. */
export function buildHeroSection(block) {
  if (!block) return null

  const { hero, warnings, valid } = mapHeroBlockToContract(block)
  if (!hero) return null

  logResolverDomain('hero', {
    extension: 'heroSection',
    valid,
    warningCount: warnings.length,
    hasCmsImage: Boolean(hero.image?.url),
  })

  if (warnings.length > 0) {
    logResolverDomain('hero', { contractWarnings: warnings })
  }

  return hero
}

/**
 * Hero activo cuando el resolver está ON y el contrato tiene título válido.
 * @returns {object | null}
 */
export function getActiveHeroSection(extensions) {
  if (!USE_BLOCK_RESOLVER) return null
  const section = extensions?.heroSection
  if (!section || !isHeroSectionActive(section)) return null

  return {
    title: section.title ?? '',
    subtitle: section.subtitle ?? '',
    highlights: section.highlights ?? [],
    primaryCta: section.primaryCta ?? { label: '', to: '/contacto', ariaLabel: '' },
    secondaryCta: section.secondaryCta ?? {
      label: '',
      to: '/trabajos-realizados',
      ariaLabel: '',
    },
    image: section.image ?? { url: null, alt: '' },
  }
}

export function collectHeroWarnings(blocks) {
  const warnings = []
  const block = findHeroBlock(blocks)
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

  const { warnings: contractWarnings } = mapHeroBlockToContract(block)
  warnings.push(...contractWarnings)

  return warnings
}

export function emptyHeroSectionExtension() {
  return null
}

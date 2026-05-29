/**
 * Block Resolver Layer — orquestador homePage.blocks[] → HomeContent.
 * Resolvers por dominio en ./resolvers/
 */
import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import { deepMerge } from '@/lib/cms/merge'
import { HomeContentContract } from '@/lib/contracts/home.contract'
import { logHomeResolver } from '@/lib/cms/homeResolverLog'
import { orderedBlocks } from '@/lib/cms/resolvers/blockUtils'
import * as heroResolver from '@/lib/cms/resolvers/heroResolver'
import * as servicesResolver from '@/lib/cms/resolvers/servicesResolver'
import * as whyUsResolver from '@/lib/cms/resolvers/whyUsResolver'
import * as specialtiesResolver from '@/lib/cms/resolvers/specialtiesResolver'
import * as portfolioResolver from '@/lib/cms/resolvers/portfolioResolver'
import * as ctaResolver from '@/lib/cms/resolvers/ctaResolver'

export {
  getValidPortfolioItems,
  getActivePortfolioSection,
} from '@/lib/cms/resolvers/portfolioResolver'
export {
  getValidWhyUsItems,
  getActiveWhyUsSection,
} from '@/lib/cms/resolvers/whyUsResolver'
export {
  getValidServiceItems,
  getActiveServicesSection,
} from '@/lib/cms/resolvers/servicesResolver'
export {
  getActiveHeroSection,
} from '@/lib/cms/resolvers/heroResolver'
export {
  getActiveSpecialtiesSection,
  mapSpecialtiesSectionToDisplayList,
} from '@/lib/cms/resolvers/specialtiesResolver'

const WARNING_COLLECTORS = [
  heroResolver.collectHeroWarnings,
  specialtiesResolver.collectSpecialtiesWarnings,
  servicesResolver.collectServicesWarnings,
  whyUsResolver.collectWhyUsWarnings,
  portfolioResolver.collectPortfolioWarnings,
  ctaResolver.collectCtaWarnings,
]

/** Campos planos espejo (misma lógica que Studio homePageSync). */
export function legacyFieldsFromBlocks(blocks) {
  const list = orderedBlocks(blocks)
  return {
    hero: heroResolver.resolveHeroMirror(heroResolver.findHeroBlock(list)),
    specialtiesNew: specialtiesResolver.resolveSpecialtiesNew(
      specialtiesResolver.findSpecialtiesBlock(list),
    ),
    services: servicesResolver.resolveServicesMirror(servicesResolver.findServicesBlock(list)),
    highlights: whyUsResolver.resolveWhyUsMirror(whyUsResolver.findWhyUsBlock(list)),
    portfolioPreview: portfolioResolver.resolvePortfolioMirror(
      portfolioResolver.findPortfolioBlockInList(list),
    ),
    ctaBanner: ctaResolver.resolveCtaMirror(ctaResolver.findCtaBlock(list)),
  }
}

function collectWarnings(blocks) {
  return WARNING_COLLECTORS.flatMap((collect) => collect(blocks))
}

function buildExtensions(blocks) {
  const list = orderedBlocks(blocks)
  const heroBlock = heroResolver.findHeroBlock(list)
  const servicesBlock = servicesResolver.findServicesBlock(list)
  const whyUsBlock = whyUsResolver.findWhyUsBlock(list)
  const portfolioBlock = portfolioResolver.findPortfolioBlockInList(list)
  const specialtiesBlock = specialtiesResolver.findSpecialtiesBlock(list)
  const heroSection = heroResolver.buildHeroSection(heroBlock)
  const whyUsSection = whyUsResolver.buildWhyUsSection(whyUsBlock)
  const servicesSection = servicesResolver.buildServicesSection(servicesBlock)
  const portfolioSection = portfolioResolver.resolvePortfolioSection(portfolioBlock)
  const specialtiesSection = specialtiesResolver.buildSpecialtiesSection(specialtiesBlock)

  return {
    heroSection,
    servicesSection,
    /** @deprecated Usar servicesSection; shape legacy adapter. */
    servicesItems: servicesResolver.resolveServicesItemsFromSection(servicesSection),
    whyUsSection,
    /** @deprecated Usar whyUsSection; se mantiene por compatibilidad interna. */
    highlightsItems: whyUsSection?.items ?? [],
    portfolioSection,
    /** @deprecated Usar portfolioSection; se mantiene por compatibilidad interna. */
    portfolioItems: portfolioSection?.items ?? [],
    specialtiesSection,
    /** @deprecated Usar specialtiesSection */
    specialtiesItems: specialtiesResolver.resolveSpecialtiesItems(specialtiesBlock),
  }
}

function applyDefaults(partial, fallback) {
  const base = fallback ?? HomeContentContract
  const merged = deepMerge(deepMerge(HomeContentContract, base), {})

  return {
    hero: deepMerge(merged.hero, partial.hero ?? {}),
    services: deepMerge(merged.services, partial.services ?? {}),
    especialidades: deepMerge(merged.especialidades, partial.especialidades ?? {}),
    highlights: deepMerge(merged.highlights, partial.highlights ?? {}),
    portfolioPreview: deepMerge(merged.portfolioPreview, partial.portfolioPreview ?? {}),
    ctaBanner: deepMerge(merged.ctaBanner, partial.ctaBanner ?? {}),
  }
}

function stripBlocksFromPage(page) {
  if (!page || typeof page !== 'object') return page
  const { blocks: _blocks, ...flat } = page
  return flat
}

function emptyExtensions() {
  return {
    heroSection: heroResolver.emptyHeroSectionExtension(),
    servicesSection: servicesResolver.emptyServicesSectionExtension(),
    servicesItems: servicesResolver.emptyServicesExtension(),
    whyUsSection: whyUsResolver.emptyWhyUsSectionExtension(),
    highlightsItems: whyUsResolver.emptyWhyUsExtension(),
    portfolioSection: portfolioResolver.emptyPortfolioExtension(),
    portfolioItems: [],
    specialtiesSection: specialtiesResolver.emptySpecialtiesSectionExtension(),
    specialtiesItems: specialtiesResolver.emptySpecialtiesExtension(),
  }
}

/**
 * Resuelve homeContent desde blocks[] (formato idéntico al frontend actual).
 * @param {object[]} blocks
 * @param {object} fallback — homeContent local validado
 */
export function resolveHomeContentFromBlocks(blocks, fallback) {
  const flat = legacyFieldsFromBlocks(blocks)
  const warnings = collectWarnings(blocks)
  const extensions = buildExtensions(blocks)
  const specialtiesBlock = specialtiesResolver.findSpecialtiesBlock(blocks)

  // portfolioPreview / highlights / hero: espejo legacy; UI usa extensions.*Section.
  const partial = {
    hero: flat.hero,
    services: flat.services,
    especialidades: specialtiesResolver.resolveSpecialtiesMirror(specialtiesBlock, fallback),
    highlights: flat.highlights,
    portfolioPreview: flat.portfolioPreview,
    ctaBanner: flat.ctaBanner,
  }

  const content = applyDefaults(partial, fallback)

  return {
    content,
    source: 'blocks-resolver',
    warnings,
    extensions,
  }
}

/**
 * Resuelve desde documento Sanity (blocks o campos planos) con fallback local.
 * @param {{ page?: object | null, fallback: object }} params
 */
export function getResolvedHomeContent({ page, fallback }) {
  const base = fallback ?? HomeContentContract
  const blocks = page?.blocks

  if (USE_BLOCK_RESOLVER && Array.isArray(blocks) && blocks.length > 0) {
    const result = resolveHomeContentFromBlocks(blocks, base)
    logHomeResolver({
      source: result.source,
      warnings: result.warnings,
      extensionsKeys: Object.keys(result.extensions ?? {}),
      blocksCount: blocks.length,
    })
    return result
  }

  const flatPage = stripBlocksFromPage(page)
  const content = applyDefaults(flatPage ?? {}, base)

  const result = {
    content,
    source: 'legacy',
    warnings: [],
    extensions: emptyExtensions(),
  }

  logHomeResolver({
    source: result.source,
    warnings: result.warnings,
    extensionsKeys: [],
    blocksCount: 0,
  })

  return result
}

export { USE_BLOCK_RESOLVER }

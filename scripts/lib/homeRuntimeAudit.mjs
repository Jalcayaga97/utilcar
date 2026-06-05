/**
 * Métricas resolver-friendly para scripts Node (sin alias @/).
 */
import { mapServiceBlockToContract, getValidServiceItems } from '../../src/lib/cms/contracts/servicesContract.js'

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b?._type === type)
}

function findPortfolioBlock(blocks) {
  return (blocks ?? []).find(
    (b) => b?._type === 'portfolioBlock' || b?._type === 'galleryBlock',
  )
}

function findWhyBlock(blocks) {
  return (
    blockOfType(blocks, 'whyUtilcarBlock') ||
    blockOfType(blocks, 'whyUsBlock')
  )
}

export function resolveRuntimeMetrics(blocks) {
  const list = blocks ?? []
  const servicesBlock = blockOfType(list, 'servicesBlock')
  const specialtiesBlock = blockOfType(list, 'specialtiesBlock')
  const whyBlock = findWhyBlock(list)
  const portfolioBlock = findPortfolioBlock(list)
  const heroBlock = blockOfType(list, 'heroBlock')

  const servicesContract = mapServiceBlockToContract(servicesBlock)
  const validServices = getValidServiceItems(servicesContract.section?.items ?? [])

  const categories = (specialtiesBlock?.categories ?? []).filter((c) => c?.title)
  const whyItems = (whyBlock?.items ?? []).filter(
    (i) => i?.title && i?.description,
  )
  const featured = (portfolioBlock?.featuredProjects ?? []).filter(
    (f) => f?.projectId,
  )

  return {
    heroActive: Boolean(heroBlock?.title),
    servicesCount: validServices.length,
    specialtiesCount: categories.length,
    whyCount: whyItems.length,
    featuredCount: featured.length,
    hasPortfolioBlock: Boolean(portfolioBlock?.title),
  }
}

export function frontendExpectations(metrics, flags) {
  const { USE_BLOCK_RESOLVER, USE_SPECIALTIES_V2 } = flags
  return {
    Hero: USE_BLOCK_RESOLVER && metrics.heroActive ? 'cms' : 'legacy',
    Services:
      USE_BLOCK_RESOLVER && metrics.servicesCount > 0
        ? metrics.servicesCount
        : 'legacy',
    Specialties:
      USE_BLOCK_RESOLVER && USE_SPECIALTIES_V2 && metrics.specialtiesCount > 0
        ? metrics.specialtiesCount
        : 'legacy',
    'Why Utilcar':
      USE_BLOCK_RESOLVER && metrics.whyCount > 0 ? metrics.whyCount : 'legacy',
    Portfolio:
      USE_BLOCK_RESOLVER && metrics.hasPortfolioBlock
        ? metrics.featuredCount || 'auto-recent'
        : 'legacy',
    CTA: USE_BLOCK_RESOLVER ? 'cms-mirror' : 'legacy',
  }
}

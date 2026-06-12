import { orderedBlocks } from '@/lib/cms/resolvers/blockUtils'
import { auditBlocksList, assertResolverInvariant } from '@/lib/cms/resolvers/global/resolverGuards.js'
import { measureRuntime } from '@/lib/cms/runtimeTiming.js'
import { BLOCK_HANDLERS } from './blockRegistry.js'
import { logPageResolver } from './pageResolverLog.js'

/**
 * Resuelve bloques de una página genérica a extensions keyed por dominio.
 * @param {object[] | undefined} blocks
 * @param {{ pageId?: string }} context
 */
export function resolvePageFromBlocks(blocks, context = {}) {
  return measureRuntime(`page-resolver:${context.pageId ?? 'page'}`, () =>
    resolvePageFromBlocksInner(blocks, context),
  )
}

function resolvePageFromBlocksInner(blocks, context = {}) {
  const list = orderedBlocks(blocks)
  const extensions = {}
  const warnings = []
  const sources = []

  for (const block of list) {
    if (block?.enabled === false) continue
    const handler = BLOCK_HANDLERS[block._type]
    if (!handler) {
      warnings.push(`unknown-block-type:${block._type}`)
      continue
    }

    const section = handler.build(block)
    if (!section) continue

    const key = extensionKeyForBlock(block._type)
    if (key) {
      extensions[key] = section
      sources.push({ type: block._type, key })
    }
  }

  for (const handler of Object.values(BLOCK_HANDLERS)) {
    if (handler.collectWarnings) {
      warnings.push(...handler.collectWarnings(list))
    }
  }

  const guardWarnings = auditBlocksList(list, context)
  warnings.push(...guardWarnings.map((w) => w.code))

  assertResolverInvariant(
    list.length === 0 || sources.length > 0 || guardWarnings.some((w) => w.code === 'empty-blocks'),
    'no-resolved-sections',
    { pageId: context.pageId, blockCount: list.length },
  )

  logPageResolver({
    pageId: context.pageId,
    blockCount: list.length,
    resolved: sources.length,
    warnings: warnings.length,
  })

  return { extensions, warnings, source: sources.length ? 'blocks-full' : 'legacy-fallback' }
}

function extensionKeyForBlock(blockType) {
  const map = {
    heroBlock: 'heroSection',
    servicesBlock: 'servicesSection',
    whyUsBlock: 'whyUsSection',
    portfolioBlock: 'portfolioSection',
    galleryBlock: 'portfolioSection',
    ctaBlock: 'ctaSection',
    faqBlock: 'faqSection',
    featuresBlock: 'featuresSection',
    mapBlock: 'mapSection',
    seoBlock: 'seoSection',
    richTextBlock: 'richTextSection',
    featureGridBlock: 'featureGridSection',
    showcaseCarouselBlock: 'showcaseCarouselSection',
    brandCarouselBlock: 'brandCarouselSection',
  }
  return map[blockType] ?? null
}

/**
 * Sección activa: CMS blocks completos o null (legacy).
 */
export function getActivePageSection(extensions, key) {
  const section = extensions?.[key]
  if (!section) return null
  if (section.enabled === false) return null
  return section
}

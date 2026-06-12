/**
 * Registro central de tipos de bloque → resolver de dominio.
 * Extensible sin modificar pageResolver.
 */
import * as heroResolver from '@/lib/cms/resolvers/heroResolver'
import * as servicesResolver from '@/lib/cms/resolvers/servicesResolver'
import * as whyUsResolver from '@/lib/cms/resolvers/whyUsResolver'
import * as portfolioResolver from '@/lib/cms/resolvers/portfolioResolver'
import * as ctaResolver from '@/lib/cms/resolvers/ctaResolver'
import * as faqBlockResolver from '@/lib/cms/resolvers/faqBlockResolver'
import * as featuresBlockResolver from '@/lib/cms/resolvers/featuresBlockResolver'
import * as mapBlockResolver from '@/lib/cms/resolvers/mapBlockResolver'
import * as seoBlockResolver from '@/lib/cms/resolvers/seoBlockResolver'
import * as richTextBlockResolver from '@/lib/cms/resolvers/richTextBlockResolver'
import * as featureGridBlockResolver from '@/lib/cms/resolvers/featureGridBlockResolver'
import * as showcaseCarouselBlockResolver from '@/lib/cms/resolvers/showcaseCarouselBlockResolver'
import * as brandCarouselBlockResolver from '@/lib/cms/resolvers/brandCarouselBlockResolver'

/** @typedef {{ type: string, find: (blocks: object[]) => object | undefined, build: (block: object) => object | null, collectWarnings?: (blocks: object[]) => string[] }} BlockHandler */

/** @type {Record<string, BlockHandler>} */
export const BLOCK_HANDLERS = {
  heroBlock: {
    type: 'heroBlock',
    find: heroResolver.findHeroBlock,
    build: heroResolver.buildHeroSection,
    collectWarnings: heroResolver.collectHeroWarnings,
  },
  servicesBlock: {
    type: 'servicesBlock',
    find: servicesResolver.findServicesBlock,
    build: servicesResolver.buildServicesSection,
    collectWarnings: servicesResolver.collectServicesWarnings,
  },
  whyUsBlock: {
    type: 'whyUsBlock',
    find: whyUsResolver.findWhyUsBlock,
    build: whyUsResolver.buildWhyUsSection,
    collectWarnings: whyUsResolver.collectWhyUsWarnings,
  },
  whyUtilcarBlock: {
    type: 'whyUtilcarBlock',
    find: whyUsResolver.findWhyUsBlock,
    build: whyUsResolver.buildWhyUsSection,
    collectWarnings: whyUsResolver.collectWhyUsWarnings,
  },
  portfolioBlock: {
    type: 'portfolioBlock',
    find: portfolioResolver.findPortfolioBlockInList,
    build: portfolioResolver.resolvePortfolioSection,
    collectWarnings: portfolioResolver.collectPortfolioWarnings,
  },
  galleryBlock: {
    type: 'galleryBlock',
    find: portfolioResolver.findPortfolioBlockInList,
    build: portfolioResolver.resolvePortfolioSection,
  },
  ctaBlock: {
    type: 'ctaBlock',
    find: ctaResolver.findCtaBlock,
    build: (block) => ctaResolver.buildCtaSection(block) ?? null,
    collectWarnings: ctaResolver.collectCtaWarnings,
  },
  faqBlock: {
    type: 'faqBlock',
    find: faqBlockResolver.findFaqBlock,
    build: faqBlockResolver.buildFaqSection,
    collectWarnings: faqBlockResolver.collectFaqWarnings,
  },
  featuresBlock: {
    type: 'featuresBlock',
    find: featuresBlockResolver.findFeaturesBlock,
    build: featuresBlockResolver.buildFeaturesSection,
    collectWarnings: featuresBlockResolver.collectFeaturesWarnings,
  },
  mapBlock: {
    type: 'mapBlock',
    find: mapBlockResolver.findMapBlock,
    build: mapBlockResolver.buildMapSection,
    collectWarnings: mapBlockResolver.collectMapWarnings,
  },
  seoBlock: {
    type: 'seoBlock',
    find: seoBlockResolver.findSeoBlock,
    build: seoBlockResolver.buildSeoSection,
    collectWarnings: seoBlockResolver.collectSeoWarnings,
  },
  richTextBlock: {
    type: 'richTextBlock',
    find: richTextBlockResolver.findRichTextBlock,
    build: richTextBlockResolver.buildRichTextSection,
    collectWarnings: richTextBlockResolver.collectRichTextWarnings,
  },
  featureGridBlock: {
    type: 'featureGridBlock',
    find: featureGridBlockResolver.findFeatureGridBlock,
    build: featureGridBlockResolver.buildFeatureGridSection,
    collectWarnings: featureGridBlockResolver.collectFeatureGridWarnings,
  },
  showcaseCarouselBlock: {
    type: 'showcaseCarouselBlock',
    find: showcaseCarouselBlockResolver.findShowcaseCarouselBlock,
    build: showcaseCarouselBlockResolver.buildShowcaseCarouselSection,
    collectWarnings: showcaseCarouselBlockResolver.collectShowcaseCarouselWarnings,
  },
  brandCarouselBlock: {
    type: 'brandCarouselBlock',
    find: brandCarouselBlockResolver.findBrandCarouselBlock,
    build: brandCarouselBlockResolver.buildBrandCarouselSection,
    collectWarnings: brandCarouselBlockResolver.collectBrandCarouselWarnings,
  },
}

export function getBlockHandler(blockType) {
  return BLOCK_HANDLERS[blockType] ?? null
}

export function listRegisteredBlockTypes() {
  return Object.keys(BLOCK_HANDLERS)
}

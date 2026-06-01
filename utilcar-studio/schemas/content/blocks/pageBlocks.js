import { BLOCK_TYPE_LABELS } from './blockBase.js'

import { LIMITS, GOVERNANCE_MESSAGES } from '../../governance/constants.js'

/** Bloques disponibles en cualquier página con Page Builder. */
export const pageBlockTypeNames = [
  'heroBlock',
  'servicesBlock',
  'whyUsBlock',
  'portfolioBlock',
  'ctaBlock',
  'faqBlock',
  'featuresBlock',
  'richTextBlock',
  'mapBlock',
  'seoBlock',
]

export function pageBlockTypes() {
  return pageBlockTypeNames.map((type) => ({ type }))
}

export const PAGE_BLOCK_TYPE_LABELS = {
  ...BLOCK_TYPE_LABELS,
  faqBlock: 'Preguntas frecuentes',
  featuresBlock: 'Características',
  richTextBlock: 'Texto enriquecido',
  mapBlock: 'Mapa',
  seoBlock: 'SEO y metadatos',
}

export function pageBlocksField(overrides = {}) {
  return {
    name: 'blocks',
    title: 'Page Builder',
    type: 'array',
    description:
      'Bloques composables de la página. Los campos legacy siguen activos como fallback hasta activar el resolver en frontend.',
    of: pageBlockTypes(),
    options: { sortable: true },
    validation: (Rule) => [
      Rule.max(LIMITS.PAGE_BLOCKS_MAX).error(GOVERNANCE_MESSAGES.pageBlocksTooMany),
      Rule.custom((blocks) => {
        if (!blocks?.length || blocks.length < LIMITS.PAGE_BLOCKS_WARN) return true
        return GOVERNANCE_MESSAGES.pageBlocksWarn
      }).warning(),
    ],
    ...overrides,
  }
}

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

/** Bloques editoriales de Página Trabajos (paridad con serviceSubPage). */
export const WORK_PAGE_BLOCK_TYPE_NAMES = [
  'heroBlock',
  'richTextBlock',
  'portfolioBlock',
  'ctaBlock',
  'seoBlock',
]

export function workPageBlockTypes() {
  return WORK_PAGE_BLOCK_TYPE_NAMES.map((type) => ({ type }))
}

export function workPageBlocksField(overrides = {}) {
  return pageBlocksField({
    title: 'Secciones de la página',
    description:
      'Hero, Intro, Projects, CTA y SEO. Los proyectos (tarjetas) se editan en la colección Proyectos.',
    of: workPageBlockTypes(),
    ...overrides,
  })
}

/** Bloques editoriales de Página Contacto (sin portfolio, servicios hub, mapa corporativo). */
export const CONTACT_PAGE_BLOCK_TYPE_NAMES = [
  'heroBlock',
  'richTextBlock',
  'faqBlock',
  'ctaBlock',
  'seoBlock',
]

export function contactPageBlockTypes() {
  return CONTACT_PAGE_BLOCK_TYPE_NAMES.map((type) => ({ type }))
}

export function contactPageBlocksField(overrides = {}) {
  return pageBlocksField({
    title: 'Secciones de la página',
    description:
      'Hero, Intro (richText), FAQ, CTA y SEO. Teléfono y dirección en Configuración del sitio → Datos corporativos.',
    of: contactPageBlockTypes(),
    ...overrides,
  })
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

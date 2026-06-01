import { LEGACY_MIRROR_FIELDS } from '../governance/homePageMigration.js'

/** Textos del Page Builder (solo Studio). */

export const PAGE_BUILDER_COPY = {
  sourceOfTruth:
    'blocks[] es la fuente única de edición. Los campos planos son espejo GROQ (deprecated).',
  builderControlled: 'Esta sección está controlada por Page Builder',
  syncedFromBlocks: 'Sincronizado desde bloques',
  legacyMirror: 'Legacy read-only mirror',
  legacyField: 'Campo deprecated (espejo)',
  legacyModeTitle: 'Advanced (Legacy Mode)',
  legacyModeDescription:
    'Solo diagnóstico técnico. Los campos planos son espejo de solo lectura cuando Page Builder está activo. Edite siempre en blocks[].',
  legacyBootstrapHint:
    'Sin bloques aún: puede editar campos planos para generar la migración inicial a blocks[].',
  flatEditRejected:
    'Escritura legacy rechazada: source blocks. Los campos planos solo sincronizan desde blocks[].',
  modeBuilder: 'Page Builder',
  modeLegacy: 'Advanced (Legacy Mode)',
  specialtiesCategoriesHint:
    'Edite specialtiesBlock.categories. El espejo specialtiesNew sincroniza automáticamente (coalesce categories → items legacy).',
  migrationRoadmap:
    'Roadmap: blocks[] → fuente única | campos planos → deprecated (solo espejo GROQ hasta migración frontend).',
  emptyBlocksTitle: 'Sin secciones aún',
  emptyBlocksDescription:
    'Use «Agregar sección» para componer la página. Cada bloque tiene preview y puede ocultarse sin eliminarlo.',
  addSection: 'Agregar sección',
  addItem: 'Agregar ítem',
  duplicateBlock: 'Duplicar sección',
  hideSection: 'Ocultar sección',
  showSection: 'Mostrar sección',
}

/** Campos planos espejo GROQ — deprecated; visibles solo en Advanced Mode. */
export const LEGACY_FLAT_FIELDS = LEGACY_MIRROR_FIELDS

export const LEGACY_FIELD_LABELS = {
  hero: 'Portada (Hero) — mirror',
  specialtiesNew: 'Especialidades — mirror (coalesce categories → items)',
  services: 'Servicios — mirror',
  highlights: 'Por qué Utilcar — mirror',
  portfolioPreview: 'Portfolio — mirror',
  ctaBanner: 'Banner CTA — mirror',
}

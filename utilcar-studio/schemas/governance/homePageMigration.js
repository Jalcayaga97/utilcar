/**
 * Roadmap y contrato blocks → campos planos (Studio).
 * El frontend aún consume campos planos vía GROQ; ver docs/FRONTEND_MIGRATION.md.
 */

/** Fuente de verdad futura: blocks[]. Campos planos = deprecated. */
export const CMS_ARCHITECTURE = {
  primary: 'blocks',
  deprecated: 'legacyFlatFields',
  phase: 'convergence',
}

/** Orígenes de sincronización (debug). */
export const SYNC_SOURCE = {
  BLOCKS: 'blocks',
  LEGACY_SYNC: 'legacy-sync',
  LEGACY_MIRROR_REJECTED: 'legacy-mirror-rejected',
  BOOTSTRAP: 'bootstrap',
  NONE: 'none',
}

/**
 * Mapping blocks → campos planos (espejo GROQ actual).
 * @type {Record<string, { flatField: string, blockType: string, notes?: string }>}
 */
export const BLOCK_TO_FLAT_MAPPING = {
  heroBlock: {
    flatField: 'hero',
    blockType: 'heroBlock',
    notes: 'Cabecera hero; highlights[] en bloque.',
  },
  specialtiesBlock: {
    flatField: 'specialtiesNew',
    blockType: 'specialtiesBlock',
    notes: 'items[] → specialtiesNew[] (única fuente editorial).',
  },
  servicesBlock: {
    flatField: 'services',
    blockType: 'servicesBlock',
    notes: 'Cabecera en flat; items[] solo en bloque hasta migración frontend.',
  },
  whyUsBlock: {
    flatField: 'highlights',
    blockType: 'whyUsBlock',
    notes: 'eyebrow/title en flat; items[] solo en bloque hasta migración frontend.',
  },
  portfolioBlock: {
    flatField: 'portfolioPreview',
    blockType: 'portfolioBlock',
    notes: 'Cabecera + previewCount en flat; items[] solo en bloque.',
  },
  ctaBlock: {
    flatField: 'ctaBanner',
    blockType: 'ctaBlock',
    notes: 'buttonLabel/buttonLink → primaryLabel/primaryTo.',
  },
}

export const LEGACY_MIRROR_FIELDS = Object.values(BLOCK_TO_FLAT_MAPPING).map((m) => m.flatField)

/** Contrato futuro del frontend (no implementado). */
export const FUTURE_HOME_CONTRACT = {
  version: 2,
  shape: {
    blocks: 'array<HomeBlock>',
  },
  removedFlatFields: LEGACY_MIRROR_FIELDS,
}

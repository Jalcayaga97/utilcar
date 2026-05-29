import { hasBlocksSourceOfTruth } from './homePageSync.js'

/** Campos planos = espejo legacy; solo lectura cuando blocks[] es fuente activa. */
export function legacyMirrorReadOnly({ document }) {
  return hasBlocksSourceOfTruth(document)
}

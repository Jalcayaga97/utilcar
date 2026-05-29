/**
 * Draft resolver — re-exporta parse productivo (compat tests/fixtures).
 */
export {
  parseSpecialtiesBlock,
  parseSpecialtiesBlock as parseSpecialtiesBlockDraft,
  buildSpecialtiesSection,
  mapSpecialtiesBlockToContract,
} from '@/lib/cms/resolvers/specialtiesResolver'

import { parseSpecialtiesBlock } from '@/lib/cms/resolvers/specialtiesResolver'
import { logSpecialtiesContract } from '@/lib/cms/contracts/specialtiesContractLog'

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logSpecialtiesResolverDraft(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar resolver:specialties:draft]', meta)
}

export function parseSpecialtiesFromBlocksDraft(blocks) {
  const block = (blocks ?? []).find(
    (entry) => entry?._type === 'specialtiesBlock' && entry?.enabled !== false,
  )
  const result = parseSpecialtiesBlock(block)

  logSpecialtiesResolverDraft({
    parsed: Boolean(result.section),
    categoryCount: result.section?.categories?.length ?? 0,
    validCount: result.validCategories.length,
    warningCount: result.warnings.length,
  })

  if (result.warnings.length) {
    logSpecialtiesContract({
      action: 'parseSpecialtiesFromBlocksDraft',
      warnings: result.warnings,
    })
  }

  return { ...result, source: 'specialties-draft' }
}

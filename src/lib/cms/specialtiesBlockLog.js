/**
 * Debug Runtime V2 specialties (solo desarrollo).
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logSpecialtiesV2(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar specialties:v2]', meta)
}

export function logSpecialtiesBlockFullSection(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: specialtiesBlock full section', meta)
}

export function warnSpecialtiesBlockLegacyFallback(reason = 'no-valid-categories') {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: specialties legacy fallback', { reason })
}

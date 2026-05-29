/**
 * Debug del piloto whyUsBlock → Home (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logWhyUsBlockFullSection(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: whyUsBlock full section', meta)
}

export function warnWhyUsBlockLegacyFallback(meta = {}) {
  if (!isDebugEnabled()) return
  console.warn(
    '[utilcar home] fallback legacy whyUs section (highlights + servicesPage highlights)',
    meta,
  )
}

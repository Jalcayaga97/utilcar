/**
 * Debug del piloto heroBlock → Hero (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logHeroBlockFullSection(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: heroBlock full section', meta)
}

export function warnHeroBlockLegacyFallback(meta = {}) {
  if (!isDebugEnabled()) return
  console.warn('[utilcar home] legacy hero section (content.hero)', meta)
}

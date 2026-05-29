/**
 * Debug del piloto portfolioBlock → Home (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logPortfolioBlockFullSection(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: portfolioBlock full section', meta)
}

export function warnPortfolioBlockLegacyFallback(meta = {}) {
  if (!isDebugEnabled()) return
  console.warn(
    '[utilcar home] portfolioBlock: fallback legacy (portfolioPreview + workPage preview)',
    meta,
  )
}

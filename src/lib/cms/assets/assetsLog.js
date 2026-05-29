/**
 * Debug Asset Resolution Layer (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logAssetsDomain(domain, meta = {}) {
  if (!isDebugEnabled()) return
  console.info(`[utilcar assets:${domain}]`, meta)
}

export function logSpecialtyAssets(meta = {}) {
  logAssetsDomain('specialties', meta)
}

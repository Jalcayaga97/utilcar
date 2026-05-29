/**
 * Debug por dominio del Block Resolver (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logResolverDomain(domain, meta = {}) {
  if (!isDebugEnabled()) return
  console.info(`[utilcar resolver:${domain}]`, meta)
}

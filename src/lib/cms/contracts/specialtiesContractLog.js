/**
 * Debug del contrato specialties (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logSpecialtiesContract(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar contract:specialties]', meta)
}

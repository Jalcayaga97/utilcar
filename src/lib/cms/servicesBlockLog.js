/**
 * Debug del piloto servicesBlock → MainServices (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

export function logServicesBlockFullSection(meta = {}) {
  if (!isDebugEnabled()) return
  console.info('[utilcar home] source: servicesBlock full section', meta)
}

export function warnServicesBlockLegacyFallback(meta = {}) {
  if (!isDebugEnabled()) return
  console.warn('[utilcar home] legacy services section (content.services + useServices)', meta)
}

export function warnServicesBlockItemOmitted(meta = {}) {
  if (!isDebugEnabled()) return
  console.warn('[utilcar home] servicesBlock: ítem omitido (contrato inválido)', meta)
}

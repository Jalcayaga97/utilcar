/**
 * Debug del Block Resolver (solo desarrollo).
 * Desactivar: VITE_HOME_RESOLVER_DEBUG=false
 */

function isDebugEnabled() {
  if (!import.meta.env?.DEV) return false
  return import.meta.env.VITE_HOME_RESOLVER_DEBUG !== 'false'
}

let lastResolveEvent = null

export function logHomeResolver(meta) {
  const event = {
    ...meta,
    at: new Date().toISOString(),
  }
  lastResolveEvent = event

  if (!isDebugEnabled()) return

  const label =
    meta.source === 'blocks-resolver'
      ? 'source: blocks resolver'
      : meta.source === 'legacy'
        ? 'source: legacy'
        : `source: ${meta.source}`

  console.info(`[utilcar home] ${label}`, {
    warnings: meta.warnings,
    extensions: meta.extensionsKeys,
    blocksCount: meta.blocksCount,
  })
}

export function getLastHomeResolverEvent() {
  return lastResolveEvent
}

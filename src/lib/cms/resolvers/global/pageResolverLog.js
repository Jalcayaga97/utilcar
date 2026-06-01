const DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_PAGE_RESOLVER_DEBUG !== 'false'

export function logPageResolver(payload) {
  if (!DEBUG) return
  console.info('[utilcar pageResolver]', payload)
}

export function warnPageLegacyFallback(pageId, detail = {}) {
  if (!DEBUG) return
  console.warn(`[utilcar pageResolver:${pageId}] legacy fallback`, detail)
}

const DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_RUNTIME_DEBUG !== 'false'

export function logRuntime(domain, meta = {}) {
  if (!DEBUG) return
  console.info(`[utilcar runtime:${domain}]`, meta)
}

export function warnRuntime(domain, code, detail = {}) {
  if (!DEBUG) return
  console.warn(`[utilcar runtime:${domain}] ${code}`, detail)
}

/**
 * Timings DEV-only para resolver/fetch (performance hardening).
 * Desactivar: VITE_RUNTIME_DEBUG=false
 */

const ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_RUNTIME_DEBUG !== 'false'

export function measureRuntime(label, fn) {
  if (!ENABLED) return fn()

  const start = performance.now()
  const result = fn()
  const elapsed = Math.round(performance.now() - start)

  if (result && typeof result.then === 'function') {
    return result.finally(() => {
      console.info(`[utilcar runtime:timing] ${label}`, { ms: elapsed })
    })
  }

  console.info(`[utilcar runtime:timing] ${label}`, { ms: elapsed })
  return result
}

export async function measureRuntimeAsync(label, fn) {
  if (!ENABLED) return fn()

  const start = performance.now()
  try {
    return await fn()
  } finally {
    console.info(`[utilcar runtime:timing] ${label}`, {
      ms: Math.round(performance.now() - start),
    })
  }
}

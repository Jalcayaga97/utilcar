/**
 * Logs DEV trazabilidad Home CMS-first.
 * VITE_HOME_RUNTIME_DEBUG=false desactiva.
 */

function enabled() {
  return import.meta.env.DEV && import.meta.env.VITE_HOME_RUNTIME_DEBUG !== 'false'
}

/**
 * @param {'hero'|'services'|'specialties'|'why-utilcar'|'portfolio'|'cta'} section
 * @param {Record<string, unknown>} data
 */
export function logHomeRuntime(section, data) {
  if (!enabled()) return
  console.info(`[home-${section}]`, data)
}

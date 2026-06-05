/**
 * Logs DEV de auditoría — Talleres Móviles y páginas de servicio.
 * Buscar en consola: [service-hero-audit] [service-portfolio-audit]
 */

export function logServiceHeroAudit(payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-hero-audit]', payload)
}

export function logServicePortfolioAudit(payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-portfolio-audit]', payload)
}

/** Traza hero — auditoría temporal (buscar [service-hero-trace]). */
export function logServiceHeroTrace(payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-hero-trace]', payload)
}

/** Traza richTextBlock — auditoría temporal (buscar [service-richtext-trace]). */
export function logServiceRichTextTrace(payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-richtext-trace]', payload)
}

/** Auditoría richText CMS-first (buscar [service-richtext-audit]). */
export function logServiceRichTextAudit(payload) {
  if (!import.meta.env.DEV) return
  console.info('[service-richtext-audit]', payload)
}

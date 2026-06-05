import { serviceCtaDefaults } from '@/content/services'

function safeString(value, fallback = '') {
  if (value == null) return fallback
  const s = String(value).trim()
  return s || fallback
}

/**
 * Normaliza siteSettings.serviceCta al shape de runtime.
 * Fallback legacy: serviceCtaDefaults (content/services.js).
 */
export function buildGlobalServiceCta(raw) {
  const cta = raw?.serviceCta ?? raw ?? {}
  return {
    eyebrow: safeString(cta.eyebrow),
    title: safeString(cta.title, serviceCtaDefaults.title),
    description: safeString(cta.description, serviceCtaDefaults.description),
    primaryLabel: safeString(cta.primaryButtonLabel, serviceCtaDefaults.primaryLabel),
    primaryTo: safeString(cta.primaryButtonUrl, serviceCtaDefaults.primaryTo),
    secondaryLabel: safeString(cta.secondaryButtonLabel),
    secondaryTo: safeString(cta.secondaryButtonUrl),
    source: raw?.serviceCta ? 'cms' : 'legacy',
  }
}

/** CTA inferior de servicios — siempre siteSettings (único origen de verdad). */
export function resolveServicePageCta(_ctaSection, globalCta) {
  return buildGlobalServiceCta(globalCta)
}

/**
 * URLs responsivas — Sanity CDN y assets locales.
 */

const DEFAULT_QUALITY = 72

export function optimizeImageUrl(url, { width = 800, quality = DEFAULT_QUALITY } = {}) {
  if (!url || typeof url !== 'string') return url

  if (url.includes('cdn.sanity.io')) {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}auto=format&fit=max&w=${width}&q=${quality}`
  }

  return url
}

/**
 * @param {string} url
 * @param {number[]} [widths]
 */
export function buildResponsiveSrcSet(url, widths = [320, 480, 640, 960, 1280]) {
  if (!url?.includes('cdn.sanity.io')) return undefined
  return widths.map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`).join(', ')
}

export const HOME_HERO_PRIMARY_SIZES =
  '(max-width: 640px) 280px, (max-width: 1024px) 360px, 480px'

export const HOME_HERO_SECONDARY_SIZES =
  '(max-width: 640px) 180px, (max-width: 1024px) 220px, 280px'

/** URL optimizada para preload del LCP (móvil-first). */
export function buildHeroPreloadHref(primaryUrl, fallbackUrl = '/webp/logo.webp') {
  if (primaryUrl?.includes('cdn.sanity.io')) {
    return optimizeImageUrl(primaryUrl, { width: 640, quality: DEFAULT_QUALITY })
  }
  return fallbackUrl
}

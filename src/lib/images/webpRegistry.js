/** @param {string} filePath */
export function toWebpPath(filePath) {
  return filePath.replace(/\.(jpe?g|png|jfif)(\?.*)?$/i, '.webp$2')
}

/**
 * Resuelve URL WebP a partir del fallback (JPG/PNG) sin imports estáticos.
 *
 * - Assets Vite: /assets/foo-HASH.jpg → /assets/foo-HASH.webp (emitido en build)
 * - Dev Vite:    /src/assets/images/x.jpg → /src/assets/images/x.webp (middleware)
 * - Public:      /logo.jpg → /webp/logo.webp (prebuild → public/webp/)
 */
export function getWebpSrc(fallbackSrc) {
  if (!fallbackSrc || typeof fallbackSrc !== 'string') return undefined

  const pathOnly = fallbackSrc.split('?')[0]
  if (pathOnly.endsWith('.webp')) return undefined

  // URLs remotas (Sanity CDN, etc.) no tienen variante WebP local en build.
  if (/^https?:\/\//i.test(pathOnly)) return undefined

  if (!/\.(jpe?g|png|jfif)$/i.test(pathOnly)) return undefined

  if (pathOnly.startsWith('/') && !pathOnly.startsWith('/assets/') && !pathOnly.startsWith('/src/')) {
    return `/webp/${pathOnly.slice(1).replace(/\.(jpe?g|png|jfif)$/i, '.webp')}`
  }

  return toWebpPath(fallbackSrc)
}

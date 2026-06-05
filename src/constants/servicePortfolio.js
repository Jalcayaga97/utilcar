/** Máximo de tarjetas workProject visibles en páginas de servicio (preview editorial). */

export const MAX_SERVICE_PORTFOLIO_ITEMS = 6



/** Slugs de las 6 sub-páginas de servicio con portfolio unificado. */

export const SERVICE_PORTFOLIO_PAGE_KEYS = [

  'talleres-moviles',

  'ventanas-lunetas',

  'equipamiento-escolar',

  'banquetas',

  'butacas',

  'accesorios',

]



/**

 * Páginas cuyo portfolio proviene exclusivamente de workProject global (sin CMS embebido).

 */

export const WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS = new Set(SERVICE_PORTFOLIO_PAGE_KEYS)



/** Título de sección por defecto cuando portfolioBlock.title está vacío (solo resolver). */

export const SERVICE_PORTFOLIO_DEFAULT_TITLE = 'Trabajos realizados'



/** Límite de tarjetas por pageKey (default: MAX_SERVICE_PORTFOLIO_ITEMS). */

export const SERVICE_PORTFOLIO_ITEM_LIMITS = {

  'equipamiento-escolar': 3,

  banquetas: 3,

  butacas: 3,

  accesorios: 3,

}



export function getServicePortfolioItemLimit(pageKey) {

  const key = String(pageKey ?? '').trim()

  return SERVICE_PORTFOLIO_ITEM_LIMITS[key] ?? MAX_SERVICE_PORTFOLIO_ITEMS

}



/** Enlace al catálogo global filtrado por categoría de servicio. */

export function buildServicePortfolioTrabajosLink(pageKey) {

  const key = String(pageKey ?? '').trim()

  if (!key) return '/trabajos-realizados'

  return `/trabajos-realizados?categoria=${encodeURIComponent(key)}`

}



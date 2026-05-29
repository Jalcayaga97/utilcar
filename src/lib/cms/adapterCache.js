/**
 * Cache en memoria con TTL + deduplicación de fetch en vuelo.
 */

const cache = Object.create(null)
const timestamps = Object.create(null)
const inflight = new Map()

/** 5 minutos — evita datos CMS obsoletos de forma indefinida. */
export const CACHE_TTL_MS = 1000 * 60 * 5

export function getCached(key) {
  const now = Date.now()

  if (cache[key] && timestamps[key] && now - timestamps[key] < CACHE_TTL_MS) {
    return cache[key]
  }

  return null
}

export function setCached(key, value) {
  cache[key] = value
  timestamps[key] = Date.now()
}

/** @deprecated Usar getCached */
export function getResultCache(key) {
  return getCached(key)
}

/** @deprecated Usar setCached */
export function setResultCache(key, value) {
  setCached(key, value)
}

/** @deprecated Usar getCached(key) !== null */
export function hasResultCache(key) {
  return getCached(key) !== null
}

/**
 * Devuelve resultado cacheado (si TTL vigente) o ejecuta loader una sola vez por clave.
 */
export async function loadCached(key, loader) {
  const cached = getCached(key)
  if (cached !== null) {
    return cached
  }

  if (inflight.has(key)) {
    return inflight.get(key)
  }

  const promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      setCached(key, value)
      inflight.delete(key)
      return value
    })
    .catch((err) => {
      inflight.delete(key)
      throw err
    })

  inflight.set(key, promise)
  return promise
}

export function clearAdapterCache() {
  for (const key of Object.keys(cache)) {
    delete cache[key]
    delete timestamps[key]
  }
  inflight.clear()
}

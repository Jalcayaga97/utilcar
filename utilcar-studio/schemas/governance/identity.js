/**
 * Resolución de identidad para validación en Studio (espejo de normalize.js — no importar frontend).
 */
export function hashTitle(title) {
  const s = String(title ?? '')
    .trim()
    .toLowerCase()
  if (!s) return ''

  let h = 5381
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return `hash-${(h >>> 0).toString(36)}`
}

export function resolveCanonicalId(item) {
  if (item == null || typeof item !== 'object') return ''

  const blockKey = item.blockMeta?.blockKey?.trim?.() ?? item.blockMeta?.blockKey
  if (blockKey) return String(blockKey).trim()

  const id = item.id?.trim?.() ?? item.id
  if (id) return String(id).trim()

  const slug = item.slug?.current?.trim?.() ?? item.slug?.trim?.() ?? item.slug
  if (slug) return String(slug).trim()

  return hashTitle(item.title)
}

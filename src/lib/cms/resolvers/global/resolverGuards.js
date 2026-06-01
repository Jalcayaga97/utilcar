/**
 * Guards compartidos — null safety, invariantes DEV-only, integridad de blocks[].
 */
import { warnRuntime } from '@/lib/cms/runtimeLog'

const DEV = import.meta.env.DEV

export function safeArray(value) {
  return Array.isArray(value) ? value : []
}

export function safeString(value, fallback = '') {
  if (value == null) return fallback
  const s = String(value).trim()
  return s || fallback
}

export function isValidHttpUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
}

export function isValidCta(cta) {
  if (!cta || typeof cta !== 'object') return false
  const label = safeString(cta.label ?? cta.buttonLabel)
  const path = safeString(cta.to ?? cta.path ?? cta.buttonLink ?? cta.primaryTo)
  if (!label && !path) return true
  return Boolean(label && path && isValidHttpUrl(path))
}

export function findDuplicateKeys(items, keyFn = (item) => item?.id ?? item?._key) {
  const seen = new Map()
  const duplicates = []

  for (const item of safeArray(items)) {
    const key = keyFn(item)
    if (!key) continue
    if (seen.has(key)) {
      duplicates.push(key)
    } else {
      seen.set(key, true)
    }
  }

  return duplicates
}

/**
 * Audita blocks[] antes/después de resolver. Retorna códigos de warning.
 * @param {object[]} blocks
 * @param {{ pageId?: string }} context
 */
export function auditBlocksList(blocks, context = {}) {
  const list = safeArray(blocks)
  const warnings = []
  const pageId = context.pageId ?? 'page'

  if (!list.length) {
    warnings.push({ code: 'empty-blocks', pageId, severity: 'info' })
    return warnings
  }

  const types = list.map((b) => b?._type).filter(Boolean)
  const typeCounts = types.reduce((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > 3 && type !== 'portfolioBlock') {
      warnings.push({ code: 'duplicate-block-type', pageId, type, count, severity: 'warn' })
    }
  }

  for (const block of list) {
    if (!block?._type) {
      warnings.push({ code: 'malformed-block', pageId, severity: 'error' })
      continue
    }

    if (block._type === 'heroBlock' && !safeString(block.title)) {
      warnings.push({ code: 'hero-missing-title', pageId, severity: 'warn' })
    }

    const ctaRaw = block.primaryCta ?? block.primaryLink ?? block
    if ((block.buttonLabel || block.primaryCta) && !isValidCta(ctaRaw)) {
      warnings.push({ code: 'invalid-cta', pageId, blockType: block._type, severity: 'warn' })
    }

    const items = block.items ?? block.categories ?? block.groups ?? []
    const dupes = findDuplicateKeys(items)
    if (dupes.length) {
      warnings.push({
        code: 'duplicated-id',
        pageId,
        blockType: block._type,
        ids: dupes,
        severity: 'warn',
      })
    }
  }

  if (DEV) {
    for (const w of warnings) {
      if (w.severity === 'error' || w.severity === 'warn') {
        warnRuntime('resolver-guard', w.code, w)
      }
    }
  }

  return warnings
}

export function assertResolverInvariant(condition, code, detail = {}) {
  if (condition || !DEV) return
  warnRuntime('invariant', code, detail)
}

export function mergeGuardWarnings(...lists) {
  return lists.flat().map((w) => (typeof w === 'string' ? { code: w } : w))
}

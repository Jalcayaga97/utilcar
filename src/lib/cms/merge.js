/**
 * Fusión profunda: Sanity sobrescribe texto; el local conserva imágenes/iconos.
 */

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function deepMerge(local, remote) {
  if (remote == null) return local
  if (local == null) return remote
  if (!isPlainObject(local) || !isPlainObject(remote)) {
    return remote !== undefined && remote !== null ? remote : local
  }

  const result = { ...local }
  for (const key of Object.keys(remote)) {
    const remoteVal = remote[key]
    const localVal = local[key]
    if (remoteVal === undefined || remoteVal === null) continue
    if (isPlainObject(localVal) && isPlainObject(remoteVal)) {
      result[key] = deepMerge(localVal, remoteVal)
    } else if (Array.isArray(remoteVal)) {
      result[key] = mergeArrayById(localVal, remoteVal)
    } else {
      result[key] = remoteVal
    }
  }
  return result
}

function mergeArrayById(localArr, remoteArr) {
  if (!Array.isArray(localArr) || localArr.length === 0) return remoteArr
  if (!remoteArr?.length) return localArr

  const localById = new Map(
    localArr.filter((item) => item?.id != null).map((item) => [item.id, item]),
  )

  return remoteArr.map((remoteItem, index) => {
    const localItem =
      remoteItem?.id != null ? localById.get(remoteItem.id) : localArr[index]
    if (!localItem) return remoteItem
    if (!isPlainObject(localItem) || !isPlainObject(remoteItem)) return remoteItem
    return deepMerge(localItem, remoteItem)
  })
}

import {
  normalizeSpecialtyList,
  toLegacySpecialtyContract,
} from '@/lib/cms/normalize'

export function mergeEspecialidades(localList, remoteList) {
  if (!remoteList?.length) return localList

  const normalizedLocal = normalizeSpecialtyList(localList, 'local')
  const normalizedRemote = normalizeSpecialtyList(remoteList, 'remote')

  const remoteByCanonical = new Map(
    normalizedRemote.map((item) => [item.canonicalId, item]),
  )

  const merged = normalizedLocal.map((localItem) => {
    const remote = remoteByCanonical.get(localItem.canonicalId)
    if (!remote) return localItem
    return {
      ...deepMerge(localItem, remote),
      image: localItem.image,
      id: localItem.canonicalId,
    }
  })

  for (const remoteItem of normalizedRemote) {
    if (!normalizedLocal.some((l) => l.canonicalId === remoteItem.canonicalId)) {
      merged.push(remoteItem)
    }
  }

  return merged.map(toLegacySpecialtyContract)
}

export function mergeServicesWithIcons(localServices, remoteServices) {
  if (!remoteServices?.length) return localServices
  const iconById = Object.fromEntries(
    localServices.map((s) => [s.id, s.icon]),
  )
  return remoteServices.map((service, index) => {
    const local = localServices.find((s) => s.id === service.id) ?? localServices[index]
    return {
      ...deepMerge(local ?? {}, service),
      icon: local?.icon ?? iconById[service.id],
    }
  })
}

export function mergeHighlightsWithIcons(localHighlights, remoteHighlights) {
  if (!remoteHighlights?.length) return localHighlights
  return remoteHighlights.map((item, index) => ({
    ...deepMerge(localHighlights[index] ?? {}, item),
    icon: localHighlights[index]?.icon,
  }))
}

export function mergePortfolioItems(localPortfolio, remotePortfolio) {
  if (!remotePortfolio?.length) return localPortfolio
  return mergeArrayById(localPortfolio, remotePortfolio)
}

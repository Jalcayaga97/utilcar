import { SYNC_SOURCE } from './homePageMigration.js'

let lastSyncEvent = null

function isDebugEnabled() {
  if (typeof import.meta === 'undefined') return false
  if (!import.meta.env?.DEV) return false
  return import.meta.env.SANITY_STUDIO_DEBUG_SYNC !== 'false'
}

/**
 * Registra origen de datos en consola (dev) y guarda último evento para UI debug.
 * @param {{ source: string, fieldsSynced?: string[], rejected?: boolean, detail?: string }} meta
 */
export function logHomePageSync(meta) {
  const event = {
    ...meta,
    at: new Date().toISOString(),
  }
  lastSyncEvent = event

  if (!isDebugEnabled()) return

  const label =
    meta.source === SYNC_SOURCE.BLOCKS
      ? 'source: blocks'
      : meta.source === SYNC_SOURCE.LEGACY_SYNC
        ? 'source: legacy sync'
        : meta.source === SYNC_SOURCE.LEGACY_MIRROR_REJECTED
          ? 'source: legacy sync (rejected write)'
          : meta.source === SYNC_SOURCE.BOOTSTRAP
            ? 'source: legacy bootstrap'
            : `source: ${meta.source}`

  console.info(`[utilcar homePage] ${label}`, {
    fieldsSynced: meta.fieldsSynced,
    rejected: meta.rejected,
    detail: meta.detail,
  })
}

export function getLastHomePageSyncEvent() {
  return lastSyncEvent
}

export function formatSyncSourceLabel(source) {
  switch (source) {
    case SYNC_SOURCE.BLOCKS:
      return 'source: blocks'
    case SYNC_SOURCE.LEGACY_SYNC:
      return 'source: legacy sync'
    case SYNC_SOURCE.LEGACY_MIRROR_REJECTED:
      return 'source: legacy sync (mirror)'
    case SYNC_SOURCE.BOOTSTRAP:
      return 'source: legacy bootstrap'
    default:
      return `source: ${source ?? 'unknown'}`
  }
}

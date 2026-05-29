/**
 * Logging de migración specialties (CLI + DEV).
 */

const PREFIX = '[utilcar migrate:specialties]'
const PREFIX_MERGE = '[utilcar migrate:specialties:merge]'
const PREFIX_VALIDATE = '[utilcar migrate:specialties:validate]'

function isEnabled() {
  if (process.env.UTILCAR_MIGRATE_SILENT === 'true') return false
  return true
}

export function logMigrate(message, meta) {
  if (!isEnabled()) return
  if (meta !== undefined) {
    console.info(PREFIX, message, meta)
  } else {
    console.info(PREFIX, message)
  }
}

export function logMigrateMerge(message, meta) {
  if (!isEnabled()) return
  if (meta !== undefined) {
    console.info(PREFIX_MERGE, message, meta)
  } else {
    console.info(PREFIX_MERGE, message)
  }
}

export function logMigrateValidate(message, meta) {
  if (!isEnabled()) return
  if (meta !== undefined) {
    console.info(PREFIX_VALIDATE, message, meta)
  } else {
    console.info(PREFIX_VALIDATE, message)
  }
}

export function logMigrateWarning(type, detail) {
  if (!isEnabled()) return
  console.warn(PREFIX_VALIDATE, { type, ...detail })
}

export function printMigrationSummary(summary) {
  logMigrate('summary', summary)
}

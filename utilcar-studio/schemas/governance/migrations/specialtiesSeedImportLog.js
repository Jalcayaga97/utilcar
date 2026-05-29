/**
 * Logging import incremental specialties desde seed.
 */

const PREFIX = '[utilcar import:specialties]'

function isEnabled() {
  return process.env.UTILCAR_IMPORT_SILENT !== 'true'
}

export function logImportSpecialties(message, meta) {
  if (!isEnabled()) return
  if (meta !== undefined) {
    console.info(PREFIX, message, meta)
  } else {
    console.info(PREFIX, message)
  }
}

export function printImportSummary(summary) {
  logImportSpecialties('summary', summary)
}

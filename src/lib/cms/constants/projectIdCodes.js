/** Prefijos oficiales por categoría de servicio. */
export const PROJECT_ID_PREFIX_BY_CATEGORY = {
  'talleres-moviles': 'TM',
  'ventanas-lunetas': 'VL',
  'equipamiento-escolar': 'EE',
  banquetas: 'BQ',
  butacas: 'BT',
  accesorios: 'AC',
  'proteccion-cabina': 'PC',
  'cambio-pisos': 'CP',
  reclinaciones: 'RL',
  fundas: 'FD',
  literas: 'LT',
  tapiceria: 'TP',
}

/** Formato: TM-001, VL-010, etc. */
export const PROJECT_ID_REGEX = /^(TM|VL|EE|BQ|BT|AC|PC|CP|RL|FD|LT|TP)-(\d{3})$/

export const PROJECT_ID_FORMAT_HINT =
  'Formato obligatorio: TM-001, VL-010, BQ-006 (prefijo en mayúsculas + guión + 3 dígitos).'

/**
 * @param {string} projectId
 * @returns {{ prefix: string, sequence: number } | null}
 */
export function parseProjectIdCode(projectId) {
  const match = PROJECT_ID_REGEX.exec(String(projectId ?? '').trim())
  if (!match) return null
  return { prefix: match[1], sequence: Number.parseInt(match[2], 10) }
}

/**
 * @param {string} prefix
 * @param {number} sequence
 */
export function formatProjectIdCode(prefix, sequence) {
  return `${prefix}-${String(sequence).padStart(3, '0')}`
}

/**
 * @param {string} projectId
 * @param {string} serviceCategory
 */
export function projectIdMatchesCategory(projectId, serviceCategory) {
  const parsed = parseProjectIdCode(projectId)
  const expectedPrefix = PROJECT_ID_PREFIX_BY_CATEGORY[serviceCategory]
  if (!parsed || !expectedPrefix) return false
  return parsed.prefix === expectedPrefix
}

/**
 * @param {string[]} existingIds
 * @param {string} prefix
 */
export function getNextProjectIdFromExisting(existingIds, prefix) {
  let max = 0
  for (const raw of existingIds) {
    const parsed = parseProjectIdCode(raw)
    if (!parsed || parsed.prefix !== prefix) continue
    if (parsed.sequence > max) max = parsed.sequence
  }
  return formatProjectIdCode(prefix, max + 1)
}

/**
 * @param {string} serviceCategory
 * @param {string[]} existingIds
 */
export function getNextProjectIdForCategory(serviceCategory, existingIds) {
  const prefix = PROJECT_ID_PREFIX_BY_CATEGORY[serviceCategory]
  if (!prefix) return null
  return getNextProjectIdFromExisting(existingIds, prefix)
}

/** Mapeo aprobado — migración Fase 1 (slug legacy → código oficial). */
export const PROJECT_ID_MIGRATION_MAP = {
  'taller-tr143': 'TM-001',
  'taller-tr247': 'TM-002',
  'taller-hiace': 'TM-003',
  'taller-tr11': 'TM-004',
  'taller-tr12': 'TM-005',
  'taller-tr9': 'TM-006',
  'vent-master': 'VL-001',
  'vent-1': 'VL-002',
  'vent-2': 'VL-003',
  'vent-3': 'VL-004',
  'vent-toyota': 'VL-005',
  'vent-peugeot': 'VL-006',
  'vent-renault': 'VL-007',
  'vent-fiat': 'VL-008',
  'vent-citroen': 'VL-009',
  'vent-chevrolet': 'VL-010',
  'esc-350': 'EE-001',
  'esc-351': 'EE-002',
  'esc-352': 'EE-003',
  'banq-traslado': 'BQ-001',
  'banq-traslado-2': 'BQ-002',
  'banq-boxer': 'BQ-003',
  'banq-adulto': 'BQ-004',
  'banq-esc-1': 'BQ-005',
  'banq-esc-2': 'BQ-006',
  'but-1': 'BT-001',
  'but-2': 'BT-002',
  'but-3': 'BT-003',
  'acc-cab': 'AC-001',
  'acc-brazos': 'AC-002',
  'acc-baliza': 'AC-003',
  'acc-distintivo': 'AC-004',
}

export const PROJECT_ID_MIGRATION_ENTRIES = Object.entries(PROJECT_ID_MIGRATION_MAP)

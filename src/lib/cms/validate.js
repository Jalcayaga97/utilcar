/**
 * Validación obligatoria antes de exponer datos a la UI.
 */

export const SCHEMA_VERSION = 1

function isCmsDev() {
  return Boolean(import.meta.env?.DEV)
}

/** Lee versión desde alias GROQ o campo Studio `schemaVersion`. */
export function getSchemaVersion(data) {
  if (data == null || typeof data !== 'object') return undefined
  return data._schemaVersion ?? data.schemaVersion
}

/**
 * Sanity Studio usa `schemaVersion`; GROQ puede alias a `_schemaVersion`.
 * Si no coincide → error → fallback local en fetch/adapters.
 */
export function assertSchemaVersion(data) {
  if (data == null || typeof data !== 'object') return

  const version = getSchemaVersion(data)
  if (version !== undefined && version !== SCHEMA_VERSION) {
    throw new Error('Schema version mismatch')
  }
}

export function stripSchemaVersion(data) {
  if (data == null || typeof data !== 'object') return data
  const rest = { ...data }
  delete rest._schemaVersion
  delete rest.schemaVersion
  return rest
}

/**
 * Aplica control de versión a payload remoto antes de merge/validación Zod.
 * @returns {object|null} payload sin metadato de versión, o null si falla versión
 */
export function parseSanityPayload(data) {
  if (!data) return null

  if (Array.isArray(data)) {
    return data
  }

  try {
    assertSchemaVersion(data)
    return stripSchemaVersion(data)
  } catch (err) {
    if (isCmsDev()) {
      console.warn('[cms] Schema version mismatch — using local fallback', err.message)
    }
    return null
  }
}

export function validateContent(schema, data, fallback, context = '') {
  const isSanityContext = context.includes('sanity')

  if (isSanityContext && data != null && typeof data === 'object') {
    try {
      assertSchemaVersion(data)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn(
          `[cms] Schema version rejected${context ? ` (${context})` : ''}`,
          err.message,
        )
      }
      const fallbackResult = schema.safeParse(fallback)
      return fallbackResult.success ? fallbackResult.data : fallback
    }
  }

  const payload = isSanityContext ? stripSchemaVersion(data) : data
  const result = schema.safeParse(payload)
  if (result.success) return result.data

  if (isCmsDev()) {
    console.warn(
      `[cms] Schema validation failed${context ? ` (${context})` : ''}`,
      result.error.flatten(),
    )
  }

  const fallbackResult = schema.safeParse(fallback)
  return fallbackResult.success ? fallbackResult.data : fallback
}

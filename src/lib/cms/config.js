/**
 * Feature flag y configuración Sanity (CMS opcional).
 */
function readEnv(key, fallback = '') {
  const value = import.meta.env[key]
  if (value === undefined || value === '') return fallback
  return value
}

export const SANITY_CONFIG = {
  projectId: readEnv('VITE_SANITY_PROJECT_ID'),
  dataset: readEnv('VITE_SANITY_DATASET', 'production'),
  apiVersion: readEnv('VITE_SANITY_API_VERSION', '2024-05-28'),
  useCdn: readEnv('VITE_SANITY_USE_CDN', 'true') !== 'false',
}

/** Si false → solo contenido local (/content). */
export const USE_SANITY = readEnv('VITE_USE_SANITY', 'false') === 'true'

/**
 * Transición especialidades: false = legacy (especialidades.items), true = specialtiesNew.
 * Migración progresiva sin cambiar UI/hooks.
 */
export const USE_NEW_SPECIALTIES = readEnv('VITE_USE_NEW_SPECIALTIES', 'false') === 'true'

/**
 * Fase 2: resolver home desde blocks[] (homeResolver.js).
 * false = campos planos GROQ + deepMerge (actual).
 */
export const USE_BLOCK_RESOLVER = readEnv('VITE_USE_BLOCK_RESOLVER', 'false') === 'true'

/**
 * Runtime V2 specialties: categories[] CMS-first vía extensions.specialtiesSection.
 * Requiere USE_BLOCK_RESOLVER. false = legacy useEspecialidades() únicamente.
 */
export const USE_SPECIALTIES_V2 = readEnv('VITE_USE_SPECIALTIES_V2', 'false') === 'true'

export function isSanityConfigured() {
  const { projectId } = SANITY_CONFIG
  return Boolean(projectId?.trim())
}

/** Sanity activo solo con flag + projectId válido. */
export function isSanityEnabled() {
  return USE_SANITY && isSanityConfigured()
}

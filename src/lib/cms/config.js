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

/**
 * Page Builder universal: resuelve blocks[] en páginas no-Home.
 * Requiere flag por dominio (SERVICES_V2, WORK_V2, CONTACT_V2).
 */
export const USE_PAGE_RESOLVER = readEnv('VITE_USE_PAGE_RESOLVER', 'false') === 'true'

export const USE_SERVICES_V2 = readEnv('VITE_USE_SERVICES_V2', 'false') === 'true'
export const USE_WORK_V2 = readEnv('VITE_USE_WORK_V2', 'false') === 'true'
export const USE_CONTACT_V2 = readEnv('VITE_USE_CONTACT_V2', 'false') === 'true'
export const USE_ABOUT_V2 = readEnv('VITE_USE_ABOUT_V2', 'false') === 'true'

export function isSanityConfigured() {
  const { projectId } = SANITY_CONFIG
  return Boolean(projectId?.trim())
}

/** Sanity activo solo con flag + projectId válido. */
export function isSanityEnabled() {
  return USE_SANITY && isSanityConfigured()
}

/** Home — blocks[] vía homeResolver. */
export function isHomeCmsActive() {
  return isSanityEnabled() && USE_BLOCK_RESOLVER
}

/** Sobre Nosotros — aboutPage.blocks[] vía pageResolver. */
export function isAboutCmsActive() {
  return isSanityEnabled() && USE_PAGE_RESOLVER && USE_ABOUT_V2
}

/** Contacto — contactPage.blocks[] vía pageResolver. */
export function isContactCmsActive() {
  return isSanityEnabled() && USE_PAGE_RESOLVER && USE_CONTACT_V2
}

/** Trabajos editorial — workPage.blocks[] vía pageResolver. */
export function isWorkCmsActive() {
  return isSanityEnabled() && USE_PAGE_RESOLVER && USE_WORK_V2
}

/** Sub-páginas de servicio — serviceSubPage.blocks[]. */
export function isServicesCmsActive() {
  return isSanityEnabled() && USE_PAGE_RESOLVER && USE_SERVICES_V2
}

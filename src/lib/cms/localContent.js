/**
 * Contenido local validado una vez — baseline para UI y fallback.
 */
import { homeContent, ESPECIALIDADES } from '@/content/home'
import {
  SERVICES,
  HIGHLIGHTS,
  SERVICE_LINKS,
  MAIN_NAV_LINKS,
  SERVICE_PATHS,
  serviceCtaDefaults,
  ctaButtonLabels,
  talleresMovilesContent,
  ventanasLunetasContent,
  equipamientoEscolarContent,
  banquetasContent,
  butacasContent,
  accesoriosContent,
  proteccionCabinaContent,
  cambioPisosContent,
  reclinacionesContent,
  fundasContent,
  literasContent,
  tapiceriaContent,
  EQUIPAMIENTO_MARCA_TABS,
  BUTACAS_CATEGORIES,
  BANQUETAS_CATEGORIES,
  ACCESORIOS_CATEGORIES,
  TAPICERIA_CATEGORIES,
} from '@/content/services'
import { workContent, TRABAJOS_PAGE_HERO } from '@/content/work'
import { aboutContent } from '@/content/about'
import { contactContent } from '@/content/contact'
import { validateContent } from '@/lib/cms/validate'
import {
  AboutContentSchema,
  ContactContentSchema,
  EspecialidadesSchema,
  HomeContentSchema,
  HomeBundleSchema,
  ServicesBundleSchema,
  WorkBundleSchema,
} from '@/lib/schemas'

const localServicesBundle = {
  services: SERVICES,
  highlights: HIGHLIGHTS,
  serviceLinks: SERVICE_LINKS,
  mainNavLinks: MAIN_NAV_LINKS,
  servicePaths: SERVICE_PATHS,
  serviceCtaDefaults,
  ctaButtonLabels,
  talleresMoviles: talleresMovilesContent,
  ventanasLunetas: ventanasLunetasContent,
  equipamientoEscolar: equipamientoEscolarContent,
  banquetas: banquetasContent,
  butacas: butacasContent,
  accesorios: accesoriosContent,
  proteccionCabina: proteccionCabinaContent,
  cambioPisos: cambioPisosContent,
  reclinaciones: reclinacionesContent,
  fundas: fundasContent,
  literas: literasContent,
  tapiceria: tapiceriaContent,
  equipamientoMarcaTabs: EQUIPAMIENTO_MARCA_TABS,
  banquetasCategories: BANQUETAS_CATEGORIES,
  butacasCategories: BUTACAS_CATEGORIES,
  accesoriosCategories: ACCESORIOS_CATEGORIES,
  tapiceriaCategories: TAPICERIA_CATEGORIES,
}

const localHomeBundle = { homeContent, especialidades: ESPECIALIDADES }
const localWorkBundle = { workContent, trabajosPageHero: TRABAJOS_PAGE_HERO }

let validatedHomeBundle
let validatedServicesBundle
let validatedWorkBundle
let validatedContact
let validatedAbout

export function getValidatedLocalHomeBundle() {
  if (!validatedHomeBundle) {
    validatedHomeBundle = validateContent(
      HomeBundleSchema,
      localHomeBundle,
      localHomeBundle,
      'local:home-bundle',
    )
  }
  return validatedHomeBundle
}

export function getValidatedLocalHomeContent() {
  return getValidatedLocalHomeBundle().homeContent
}

export function getValidatedLocalEspecialidades() {
  return getValidatedLocalHomeBundle().especialidades
}

export function getValidatedLocalServicesBundle() {
  if (!validatedServicesBundle) {
    validatedServicesBundle = validateContent(
      ServicesBundleSchema,
      localServicesBundle,
      localServicesBundle,
      'local:services-bundle',
    )
  }
  return validatedServicesBundle
}

export function getValidatedLocalWorkBundle() {
  if (!validatedWorkBundle) {
    validatedWorkBundle = validateContent(
      WorkBundleSchema,
      localWorkBundle,
      localWorkBundle,
      'local:work-bundle',
    )
  }
  return validatedWorkBundle
}

export function getValidatedLocalWorkContent() {
  return getValidatedLocalWorkBundle().workContent
}

export function getValidatedLocalContactContent() {
  if (!validatedContact) {
    validatedContact = validateContent(
      ContactContentSchema,
      contactContent,
      contactContent,
      'local:contact',
    )
  }
  return validatedContact
}

export function getValidatedLocalAboutContent() {
  if (!validatedAbout) {
    validatedAbout = validateContent(
      AboutContentSchema,
      aboutContent,
      aboutContent,
      'local:about',
    )
  }
  return validatedAbout
}

/** Re-export schemas usados en adapters para validación puntual. */
export { HomeContentSchema, EspecialidadesSchema, ContactContentSchema }

import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalServicesBundle } from '@/lib/cms/localContent'
import { deepMerge, mergeHighlightsWithIcons, mergeServicesWithIcons } from '@/lib/cms/merge'
import { validateContent } from '@/lib/cms/validate'
import { ServicesBundleSchema } from '@/lib/schemas'
import { fetchServicesPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:services-bundle'

async function loadServicesBundleFromSanity() {
  const local = getValidatedLocalServicesBundle()
  const remote = await fetchServicesPage()
  if (!remote) return local

  const merged = {
    services: remote.services?.length
      ? mergeServicesWithIcons(local.services, remote.services)
      : local.services,
    highlights: remote.highlights?.length
      ? mergeHighlightsWithIcons(local.highlights, remote.highlights)
      : local.highlights,
    serviceLinks: remote.serviceLinks?.length ? remote.serviceLinks : local.serviceLinks,
    mainNavLinks: remote.mainNavLinks?.length ? remote.mainNavLinks : local.mainNavLinks,
    servicePaths: remote.serviceLinks?.length
      ? remote.serviceLinks.map((l) => l.path)
      : local.servicePaths,
    serviceCtaDefaults: remote.serviceCtaDefaults
      ? deepMerge(local.serviceCtaDefaults, remote.serviceCtaDefaults)
      : local.serviceCtaDefaults,
    ctaButtonLabels: remote.ctaButtonLabels
      ? deepMerge(local.ctaButtonLabels, remote.ctaButtonLabels)
      : local.ctaButtonLabels,
    talleresMoviles: remote.talleresMoviles
      ? deepMerge(local.talleresMoviles, remote.talleresMoviles)
      : local.talleresMoviles,
    ventanasLunetas: remote.ventanasLunetas
      ? deepMerge(local.ventanasLunetas, remote.ventanasLunetas)
      : local.ventanasLunetas,
    equipamientoEscolar: remote.equipamientoEscolar
      ? deepMerge(local.equipamientoEscolar, remote.equipamientoEscolar)
      : local.equipamientoEscolar,
    banquetas: remote.banquetas ? deepMerge(local.banquetas, remote.banquetas) : local.banquetas,
    butacas: remote.butacas ? deepMerge(local.butacas, remote.butacas) : local.butacas,
    accesorios: remote.accesorios
      ? deepMerge(local.accesorios, remote.accesorios)
      : local.accesorios,
    ventanasBrands: remote.ventanasBrands?.length
      ? remote.ventanasBrands
      : local.ventanasBrands,
    banquetasCategories: remote.banquetasCategories?.length
      ? remote.banquetasCategories
      : local.banquetasCategories,
    accesoriosCategories: remote.accesoriosCategories?.length
      ? remote.accesoriosCategories
      : local.accesoriosCategories,
  }

  return validateContent(ServicesBundleSchema, merged, local, 'sanity:services-bundle')
}

async function resolveServicesBundle() {
  const local = getValidatedLocalServicesBundle()

  if (!isSanityEnabled()) {
    return local
  }

  try {
    return await loadCached(CACHE_KEY, loadServicesBundleFromSanity)
  } catch {
    return local
  }
}

async function fromBundle(selector) {
  const bundle = await resolveServicesBundle()
  return selector(bundle)
}

export async function getServices() {
  return fromBundle((b) => b.services)
}

export async function getHighlights() {
  return fromBundle((b) => b.highlights)
}

export async function getServiceLinks() {
  return fromBundle((b) => b.serviceLinks)
}

export async function getMainNavLinks() {
  return fromBundle((b) => b.mainNavLinks)
}

export async function getServicePaths() {
  return fromBundle((b) => b.servicePaths)
}

export async function getServiceCtaDefaults() {
  return fromBundle((b) => b.serviceCtaDefaults)
}

export async function getCtaButtonLabels() {
  return fromBundle((b) => b.ctaButtonLabels)
}

export async function getTalleresMovilesContent() {
  return fromBundle((b) => b.talleresMoviles)
}

export async function getVentanasLunetasContent() {
  return fromBundle((b) => b.ventanasLunetas)
}

export async function getEquipamientoEscolarContent() {
  return fromBundle((b) => b.equipamientoEscolar)
}

export async function getBanquetasContent() {
  return fromBundle((b) => b.banquetas)
}

export async function getButacasContent() {
  return fromBundle((b) => b.butacas)
}

export async function getAccesoriosContent() {
  return fromBundle((b) => b.accesorios)
}

export async function getVentanasBrands() {
  return fromBundle((b) => b.ventanasBrands)
}

export async function getBanquetasCategories() {
  return fromBundle((b) => b.banquetasCategories)
}

export async function getAccesoriosCategories() {
  return fromBundle((b) => b.accesoriosCategories)
}

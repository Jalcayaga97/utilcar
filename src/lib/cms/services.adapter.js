import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalServicesBundle } from '@/lib/cms/localContent'
import { deepMerge, mergeHighlightsWithIcons, mergeServicesWithIcons } from '@/lib/cms/merge'
import { logServiceHeroTrace } from '@/lib/cms/servicePageAuditLog'
import { mapServicePageRuntime } from '@/lib/cms/resolvers/servicesPageResolver'
import { validateContent } from '@/lib/cms/validate'
import { ServicesBundleSchema } from '@/lib/schemas'
import { normalizeWorkProjectList } from '@/lib/cms/contracts/workProjectContract'
import { mergeWorkProjectCatalog } from '@/lib/cms/resolvers/workProjectsResolver'
import {
  fetchServiceSubPage,
  fetchServicesPage,
  fetchSiteSettings,
  fetchWorkProjects,
} from '@/lib/sanity/fetch'
import { resolveServiceSubPageDocument } from '@/lib/cms/resolvers/servicesPageResolver'
import { buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'

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
    talleresMoviles: local.talleresMoviles,
    ventanasLunetas: local.ventanasLunetas,
    equipamientoEscolar: local.equipamientoEscolar,
    banquetas: local.banquetas,
    butacas: local.butacas,
    accesorios: local.accesorios,
    proteccionCabina: local.proteccionCabina,
    cambioPisos: local.cambioPisos,
    reclinaciones: local.reclinaciones,
    fundas: local.fundas,
    literas: local.literas,
    tapiceria: local.tapiceria,
    equipamientoMarcaTabs: local.equipamientoMarcaTabs,
    banquetasCategories: local.banquetasCategories,
    butacasCategories: local.butacasCategories,
    accesoriosCategories: local.accesoriosCategories,
    tapiceriaCategories: local.tapiceriaCategories,
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

export async function getEquipamientoMarcaTabs() {
  return fromBundle((b) => b.equipamientoMarcaTabs)
}

export async function getBanquetasCategories() {
  return fromBundle((b) => b.banquetasCategories)
}

export async function getButacasCategories() {
  return fromBundle((b) => b.butacasCategories)
}

export async function getAccesoriosCategories() {
  return fromBundle((b) => b.accesoriosCategories)
}

const SERVICE_PAGE_KEYS = {
  'talleres-moviles': 'talleresMoviles',
  'ventanas-lunetas': 'ventanasLunetas',
  'equipamiento-escolar': 'equipamientoEscolar',
  banquetas: 'banquetas',
  butacas: 'butacas',
  accesorios: 'accesorios',
  'proteccion-cabina': 'proteccionCabina',
  'cambio-pisos': 'cambioPisos',
  reclinaciones: 'reclinaciones',
  fundas: 'fundas',
  literas: 'literas',
  tapiceria: 'tapiceria',
}

function legacyTabsForPage(pageKey, bundle) {
  if (pageKey === 'equipamiento-escolar') return bundle.equipamientoMarcaTabs ?? []
  if (pageKey === 'banquetas') return bundle.banquetasCategories ?? []
  if (pageKey === 'butacas') return bundle.butacasCategories ?? []
  if (pageKey === 'accesorios') return bundle.accesoriosCategories ?? []
  if (pageKey === 'tapiceria') return bundle.tapiceriaCategories ?? []
  return []
}

export async function getGlobalServiceCta() {
  if (!isSanityEnabled()) {
    return buildGlobalServiceCta()
  }
  try {
    const settings = await fetchSiteSettings()
    return buildGlobalServiceCta(settings)
  } catch {
    return buildGlobalServiceCta()
  }
}

export async function getServicePageDisplay(pageKey) {
  const field = SERVICE_PAGE_KEYS[pageKey]
  if (!field) {
    return {
      content: {},
      heroImage: null,
      showcaseImages: [],
      portfolioProjects: [],
      portfolioSource: 'none',
      tabs: [],
      seo: null,
      source: 'legacy',
    }
  }

  const bundle = getValidatedLocalServicesBundle()
  const legacyContent = {
    ...bundle[field],
    tabs: legacyTabsForPage(pageKey, bundle),
  }

  if (!isSanityEnabled()) {
    return mapServicePageRuntime(pageKey, legacyContent, {
      source: 'legacy-fallback',
      extensions: {},
      tabs: [],
    })
  }

  try {
    const [remote, globalCta, workProjectsRaw] = await Promise.all([
      fetchServiceSubPage(pageKey),
      getGlobalServiceCta(),
      fetchWorkProjects().catch(() => []),
    ])
    const workProjects = isSanityEnabled()
      ? normalizeWorkProjectList(workProjectsRaw ?? [])
      : mergeWorkProjectCatalog(workProjectsRaw ?? [])
    const resolved = remote
      ? {
          extensions: remote.extensions ?? {},
          source: remote._pageSource ?? 'legacy-fallback',
          _pageSource: remote._pageSource,
          tabs: remote.tabs ?? [],
          tabsSection: remote.tabsSection,
          introExtras: remote.introExtras,
        }
      : resolveServiceSubPageDocument(null, pageKey)

    return mapServicePageRuntime(pageKey, legacyContent, resolved, { globalCta, workProjects })
  } catch (err) {
    if (import.meta.env.DEV) {
      logServiceHeroTrace({
        pageKey,
        runtimeSource: 'legacy-fallback',
        hasCmsHero: false,
        heroImage: null,
        heroImageResolved: null,
        highlightsRaw: [],
        highlightsResolved: [],
        highlightsCount: 0,
        extensionKeys: [],
        fetchError: err?.message ?? String(err),
      })
    }
    const workProjectsRaw = (await fetchWorkProjects().catch(() => [])) ?? []
    const workProjects = isSanityEnabled()
      ? normalizeWorkProjectList(workProjectsRaw)
      : mergeWorkProjectCatalog(workProjectsRaw)
    return mapServicePageRuntime(
      pageKey,
      legacyContent,
      {
        source: 'legacy-fallback',
        extensions: {},
        tabs: [],
      },
      { workProjects },
    )
  }
}

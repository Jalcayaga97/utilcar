import { isSanityEnabled, USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getResolvedHomeContent } from '@/lib/cms/homeResolver'
import { deepMerge, mergeEspecialidades } from '@/lib/cms/merge'
import {
  getValidatedLocalEspecialidades,
  getValidatedLocalHomeBundle,
  getValidatedLocalHomeContent,
  getValidatedLocalWorkBundle,
} from '@/lib/cms/localContent'
import { mergeWorkProjectCatalog, resolveHomePortfolioDisplay } from '@/lib/cms/resolvers/workProjectsResolver'
import { validateContent } from '@/lib/cms/validate'
import { HomeBundleSchema } from '@/lib/schemas'
import { fetchEspecialidades, fetchHomePage, fetchWorkProjects } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:home-bundle'

export const EMPTY_HOME_EXTENSIONS = {
  heroSection: null,
  servicesSection: null,
  servicesItems: [],
  whyUsSection: null,
  highlightsItems: [],
  portfolioSection: null,
  portfolioItems: [],
  specialtiesSection: null,
  specialtiesItems: [],
}

function withHomeExtensions(homeContent, extensions) {
  return {
    ...homeContent,
    extensions: extensions ?? EMPTY_HOME_EXTENSIONS,
  }
}

export function getLocalHomeContent() {
  return getValidatedLocalHomeContent()
}

export function getLocalEspecialidades() {
  return getValidatedLocalEspecialidades()
}

async function loadHomeBundleFromSanity() {
  const local = getValidatedLocalHomeBundle()
  const [page, especialidadesItems] = await Promise.all([
    fetchHomePage(),
    fetchEspecialidades(),
  ])

  if (!page && !especialidadesItems?.length) return local

  let homeContent = local.homeContent
  let extensions = EMPTY_HOME_EXTENSIONS
  if (page) {
    if (USE_BLOCK_RESOLVER && page.blocks?.length) {
      const resolved = getResolvedHomeContent({ page, fallback: local.homeContent })
      homeContent = resolved.content
      extensions = resolved.extensions ?? EMPTY_HOME_EXTENSIONS
    } else {
      const { hero, services, especialidades, highlights, portfolioPreview, ctaBanner, blocks: _b, ...rest } =
        page
      homeContent = deepMerge(local.homeContent, {
        hero,
        services,
        especialidades,
        highlights,
        portfolioPreview,
        ctaBanner,
        ...rest,
      })
    }
  }
  if (homeContent.especialidades?.items) {
    delete homeContent.especialidades.items
  }

  const merged = {
    homeContent,
    especialidades: especialidadesItems?.length
      ? mergeEspecialidades(local.especialidades, especialidadesItems)
      : local.especialidades,
  }

  const validated = validateContent(HomeBundleSchema, merged, local, 'sanity:home-bundle')
  return { ...validated, extensions }
}

async function resolveHomeBundle() {
  const local = getValidatedLocalHomeBundle()

  if (!isSanityEnabled()) {
    return local
  }

  try {
    return await loadCached(CACHE_KEY, loadHomeBundleFromSanity)
  } catch {
    return local
  }
}

/**
 * Contenido Home — validado, cacheado, fallback local garantizado.
 */
export async function getHomeContent() {
  const bundle = await resolveHomeBundle()
  return withHomeExtensions(bundle.homeContent, bundle.extensions)
}

/**
 * Especialidades con imágenes locales preservadas.
 */
export async function getEspecialidades() {
  const bundle = await resolveHomeBundle()
  return bundle.especialidades
}

/** Valor síncrono para primer render / sin Sanity — misma lógica que getHomePortfolioCards(). */
export function getLocalHomePortfolioCards() {
  const homeBundle = getValidatedLocalHomeBundle()
  const workBundle = getValidatedLocalWorkBundle()
  const portfolioSection = homeBundle.extensions?.portfolioSection ?? null
  const limit = portfolioSection?.previewCount ?? homeBundle.homeContent?.portfolioPreview?.previewCount ?? 3
  const catalog = mergeWorkProjectCatalog(workBundle.workProjects ?? workBundle.workContent?.portfolio ?? [])
  const { projects } = resolveHomePortfolioDisplay(portfolioSection, catalog, {
    limit,
    legacyPreview: workBundle.workContent?.preview ?? [],
  })
  return projects
}

/**
 * Tarjetas Trabajos recientes del Home — respeta selectedProjects y previewCount del portfolioBlock.
 */
export async function getHomePortfolioCards() {
  if (!isSanityEnabled()) {
    return getLocalHomePortfolioCards()
  }

  try {
    const bundle = await resolveHomeBundle()
    const portfolioSection = bundle.extensions?.portfolioSection ?? null
    const limit = portfolioSection?.previewCount ?? bundle.homeContent?.portfolioPreview?.previewCount ?? 3
    const workProjectsRaw = await fetchWorkProjects().catch(() => [])
    const catalog = mergeWorkProjectCatalog(workProjectsRaw ?? [])
    const workBundle = getValidatedLocalWorkBundle()
    const { projects } = resolveHomePortfolioDisplay(portfolioSection, catalog, {
      limit,
      legacyPreview: workBundle.workContent?.preview ?? [],
    })
    return projects
  } catch {
    return getLocalHomePortfolioCards()
  }
}

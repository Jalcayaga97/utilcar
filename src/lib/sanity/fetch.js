import { getSanityClient } from '@/lib/sanity/client'
import { loadCached } from '@/lib/cms/adapterCache'
import { USE_BLOCK_RESOLVER, USE_CONTACT_V2, USE_PAGE_RESOLVER, USE_SERVICES_V2, USE_WORK_V2 } from '@/lib/cms/config'
import { legacyFieldsFromBlocks } from '@/lib/cms/homeResolver'
import { resolveContactPageDocument } from '@/lib/cms/resolvers/contactPageResolver'
import { resolveServicesPageDocument } from '@/lib/cms/resolvers/servicesPageResolver'
import { resolveWorkPageDocument } from '@/lib/cms/resolvers/workPageResolver'
import { getActiveSpecialties } from '@/lib/cms/specialties'
import { parseSanityPayload } from '@/lib/cms/validate'
import {
  CONTACT_QUERY,
  CONTACT_QUERY_WITH_BLOCKS,
  ESPECIALIDADES_QUERY,
  HOME_QUERY,
  HOME_QUERY_WITH_BLOCKS,
  SERVICES_QUERY,
  SERVICES_QUERY_WITH_BLOCKS,
  WORK_QUERY,
  WORK_QUERY_WITH_BLOCKS,
} from '@/lib/sanity/queries'

async function fetchQuery(query) {
  const client = getSanityClient()
  if (!client) return null
  const raw = await client.fetch(query)
  return parseSanityPayload(raw)
}

function extractSpecialtiesPayload(page) {
  if (!page) return { legacy: [], specialtiesNew: [] }
  return {
    legacy: page.especialidadesLegacy ?? page.items ?? [],
    specialtiesNew: page.specialtiesNew ?? [],
  }
}

export function fetchHomePage() {
  const query = USE_BLOCK_RESOLVER ? HOME_QUERY_WITH_BLOCKS : HOME_QUERY
  const cacheKey = USE_BLOCK_RESOLVER ? 'sanity:home-page-blocks' : 'sanity:home-page'
  return loadCached(cacheKey, () => fetchQuery(query))
}

export function fetchEspecialidades() {
  return loadCached('sanity:especialidades', async () => {
    const page = USE_BLOCK_RESOLVER
      ? await fetchHomePage()
      : await fetchQuery(ESPECIALIDADES_QUERY)
    const { legacy, specialtiesNew } = extractSpecialtiesPayload(page)
    const fromBlocks =
      USE_BLOCK_RESOLVER && page?.blocks?.length
        ? (legacyFieldsFromBlocks(page.blocks).specialtiesNew ?? [])
        : []
    const mergedNew = specialtiesNew?.length ? specialtiesNew : fromBlocks
    return getActiveSpecialties({ legacy, specialtiesNew: mergedNew })
  })
}

/**
 * Expone legacy + nuevo + fuente activa (sin consumir en UI aún).
 */
export function fetchHomeSpecialtiesModules() {
  return loadCached('sanity:home-specialties-modules', async () => {
    const page = USE_BLOCK_RESOLVER
      ? await fetchHomePage()
      : await fetchQuery(ESPECIALIDADES_QUERY)
    const { legacy, specialtiesNew } = extractSpecialtiesPayload(page)
    return {
      especialidadesLegacy: legacy,
      specialtiesNew,
      active: getActiveSpecialties({ legacy, specialtiesNew }),
    }
  })
}

export function fetchServicesPage() {
  const query =
    USE_PAGE_RESOLVER && USE_SERVICES_V2 ? SERVICES_QUERY_WITH_BLOCKS : SERVICES_QUERY
  const cacheKey =
    USE_PAGE_RESOLVER && USE_SERVICES_V2 ? 'sanity:services-page-blocks' : 'sanity:services-page'
  return loadCached(cacheKey, async () => {
    const doc = await fetchQuery(query)
    if (!doc) return null
    const resolved = resolveServicesPageDocument(doc)
    return { ...doc, extensions: resolved.extensions, _pageSource: resolved.source }
  })
}

export function fetchWorkPage() {
  const query = USE_PAGE_RESOLVER && USE_WORK_V2 ? WORK_QUERY_WITH_BLOCKS : WORK_QUERY
  const cacheKey =
    USE_PAGE_RESOLVER && USE_WORK_V2 ? 'sanity:work-page-blocks' : 'sanity:work-page'
  return loadCached(cacheKey, async () => {
    const doc = await fetchQuery(query)
    if (!doc) return null
    const resolved = resolveWorkPageDocument(doc)
    return { ...doc, extensions: resolved.extensions, _pageSource: resolved.source }
  })
}

export function fetchContactPage() {
  const query =
    USE_PAGE_RESOLVER && USE_CONTACT_V2 ? CONTACT_QUERY_WITH_BLOCKS : CONTACT_QUERY
  const cacheKey =
    USE_PAGE_RESOLVER && USE_CONTACT_V2 ? 'sanity:contact-page-blocks' : 'sanity:contact-page'
  return loadCached(cacheKey, async () => {
    const doc = await fetchQuery(query)
    if (!doc) return null
    const resolved = resolveContactPageDocument(doc)
    return { ...doc, extensions: resolved.extensions, _pageSource: resolved.source }
  })
}

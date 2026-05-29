import { getSanityClient } from '@/lib/sanity/client'
import { loadCached } from '@/lib/cms/adapterCache'
import { USE_BLOCK_RESOLVER } from '@/lib/cms/config'
import { legacyFieldsFromBlocks } from '@/lib/cms/homeResolver'
import { getActiveSpecialties } from '@/lib/cms/specialties'
import { parseSanityPayload } from '@/lib/cms/validate'
import {
  CONTACT_QUERY,
  ESPECIALIDADES_QUERY,
  HOME_QUERY,
  HOME_QUERY_WITH_BLOCKS,
  SERVICES_QUERY,
  WORK_QUERY,
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
  return loadCached('sanity:services-page', () => fetchQuery(SERVICES_QUERY))
}

export function fetchWorkPage() {
  return loadCached('sanity:work-page', () => fetchQuery(WORK_QUERY))
}

export function fetchContactPage() {
  return loadCached('sanity:contact-page', () => fetchQuery(CONTACT_QUERY))
}

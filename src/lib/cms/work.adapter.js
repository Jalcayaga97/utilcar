import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalWorkBundle } from '@/lib/cms/localContent'
import { normalizeWorkProjectList } from '@/lib/cms/contracts/workProjectContract'
import { buildActiveWorkBundle, mapWorkPageRuntime } from '@/lib/cms/resolvers/workPageResolver'
import { buildGlobalServiceCta } from '@/lib/cms/resolvers/globalServiceCtaResolver'
import {
  mergeWorkProjectCatalog,
  resolveHomeFeaturedProjects,
} from '@/lib/cms/resolvers/workProjectsResolver'
import { validateContent } from '@/lib/cms/validate'
import { WorkBundleSchema } from '@/lib/schemas'
import { fetchWorkPage, fetchWorkProjects, fetchSiteSettings } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:work-bundle'

async function loadWorkBundleFromSanity() {
  const local = getValidatedLocalWorkBundle()
  const [remote, workProjectsRaw] = await Promise.all([
    fetchWorkPage(),
    fetchWorkProjects().catch(() => []),
  ])

  const workProjects = isSanityEnabled()
    ? normalizeWorkProjectList(workProjectsRaw ?? [])
    : mergeWorkProjectCatalog(workProjectsRaw ?? [])

  if (!remote) {
    return buildActiveWorkBundle(local, { workProjects })
  }

  return buildActiveWorkBundle(local, { ...remote, workProjects })
}

async function resolveWorkBundle() {
  const local = getValidatedLocalWorkBundle()

  if (!isSanityEnabled()) {
    return { ...local, _workSource: 'legacy' }
  }

  try {
    const bundle = await loadCached(CACHE_KEY, loadWorkBundleFromSanity)
    return validateContent(WorkBundleSchema, bundle, local, 'sanity:work-bundle')
  } catch {
    return { ...local, _workSource: 'legacy' }
  }
}

export async function getWorkContent() {
  const bundle = await resolveWorkBundle()
  return bundle.workContent
}

export async function getTrabajosPreview() {
  const bundle = await resolveWorkBundle()
  const limit = bundle.workContent?.ui?.homePreviewMax ?? 4
  const catalog = bundle.workProjects ?? bundle.workContent?.portfolio ?? []
  const legacyPreview = isSanityEnabled() ? [] : bundle.workContent?.preview ?? []
  return resolveHomeFeaturedProjects(catalog, { limit, legacyPreview })
}

export async function getTrabajosPageHero() {
  const bundle = await resolveWorkBundle()
  return bundle.trabajosPageHero
}

export async function getWorkBundle() {
  return resolveWorkBundle()
}

function localWorkPageDisplay() {
  const bundle = getValidatedLocalWorkBundle()
  return {
    content: bundle.workContent.page,
    heroImage: bundle.trabajosPageHero,
    seo: null,
    source: 'legacy',
  }
}

export async function getWorkPageDisplay() {
  const local = getValidatedLocalWorkBundle()

  if (!isSanityEnabled()) {
    return localWorkPageDisplay()
  }

  try {
    const [remote, globalCtaRaw, workProjectsRaw] = await Promise.all([
      fetchWorkPage(),
      fetchSiteSettings().catch(() => null),
      fetchWorkProjects().catch(() => []),
    ])

    const workProjects = normalizeWorkProjectList(workProjectsRaw ?? [])
    const globalCta = buildGlobalServiceCta(globalCtaRaw)
    const legacyBundle = local

    const resolved = remote
      ? {
          extensions: remote.extensions ?? {},
          ui: remote.ui,
          _pageSource: remote._pageSource,
        }
      : { extensions: {} }

    const mapped = mapWorkPageRuntime(legacyBundle, resolved, { workProjects, globalCta })

    if (mapped._workSource !== 'cms') {
      return localWorkPageDisplay()
    }

    return {
      content: mapped.workContent.page,
      heroImage: mapped.trabajosPageHero,
      seo: mapped.seo ?? null,
      source: 'cms',
    }
  } catch {
    return localWorkPageDisplay()
  }
}

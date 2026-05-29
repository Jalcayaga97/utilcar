import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { getValidatedLocalWorkBundle } from '@/lib/cms/localContent'
import { deepMerge, mergePortfolioItems } from '@/lib/cms/merge'
import { validateContent } from '@/lib/cms/validate'
import { WorkBundleSchema } from '@/lib/schemas'
import { fetchWorkPage } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:work-bundle'

async function loadWorkBundleFromSanity() {
  const local = getValidatedLocalWorkBundle()
  const remote = await fetchWorkPage()
  if (!remote) return local

  const merged = {
    workContent: {
      ...local.workContent,
      page: remote.page ? deepMerge(local.workContent.page, remote.page) : local.workContent.page,
      filters: remote.filters?.length ? remote.filters : local.workContent.filters,
      portfolio: remote.portfolio?.length
        ? mergePortfolioItems(local.workContent.portfolio, remote.portfolio)
        : local.workContent.portfolio,
      preview: remote.preview?.length
        ? mergePortfolioItems(local.workContent.preview, remote.preview)
        : local.workContent.preview,
      ui: remote.ui ? deepMerge(local.workContent.ui, remote.ui) : local.workContent.ui,
    },
    trabajosPageHero: local.trabajosPageHero,
  }

  return validateContent(WorkBundleSchema, merged, local, 'sanity:work-bundle')
}

async function resolveWorkBundle() {
  const local = getValidatedLocalWorkBundle()

  if (!isSanityEnabled()) {
    return local
  }

  try {
    return await loadCached(CACHE_KEY, loadWorkBundleFromSanity)
  } catch {
    return local
  }
}

/**
 * Portfolio completo + metadatos de página.
 */
export async function getWorkContent() {
  const bundle = await resolveWorkBundle()
  return bundle.workContent
}

export async function getTrabajosPreview() {
  const bundle = await resolveWorkBundle()
  return bundle.workContent.preview
}

export async function getTrabajosPageHero() {
  const bundle = await resolveWorkBundle()
  return bundle.trabajosPageHero
}

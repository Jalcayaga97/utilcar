import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import { buildCompanyInfo, buildCompanyInfoFromSite } from '@/lib/cms/resolvers/companyResolver'
import { fetchSiteSettings } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:company-info'

export function getLocalCompanyInfo() {
  return buildCompanyInfoFromSite()
}

export async function getCompanyInfo() {
  if (!isSanityEnabled()) {
    return getLocalCompanyInfo()
  }

  try {
    return await loadCached(CACHE_KEY, async () => {
      const settings = await fetchSiteSettings().catch(() => null)
      return buildCompanyInfo(settings)
    })
  } catch {
    return getLocalCompanyInfo()
  }
}

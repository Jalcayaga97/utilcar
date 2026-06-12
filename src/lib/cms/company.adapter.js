import { isSanityEnabled } from '@/lib/cms/config'
import { loadCached } from '@/lib/cms/adapterCache'
import {
  buildCompanyInfo,
  buildCompanyInfoFromSite,
  resolveContactFormEmail,
} from '@/lib/cms/resolvers/companyResolver'
import { ENV } from '@/constants/env'
import { fetchSiteSettings } from '@/lib/sanity/fetch'

const CACHE_KEY = 'cms:company-info'

let cachedLocalCompanyInfo

export function getLocalCompanyInfo() {
  if (!cachedLocalCompanyInfo) {
    cachedLocalCompanyInfo = buildCompanyInfoFromSite()
  }
  return cachedLocalCompanyInfo
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

export async function getContactFormEmail() {
  if (!isSanityEnabled()) {
    return ENV.contactEmail
  }

  try {
    const settings = await fetchSiteSettings().catch(() => null)
    return resolveContactFormEmail(settings)
  } catch {
    return ENV.contactEmail
  }
}

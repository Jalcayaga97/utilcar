import { getPageSeo } from '@/constants/seo'
import {
  enrichSeoSectionForRuntime,
  mergePageSeo,
} from '@/lib/cms/contracts/seoBlockContract'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'

/**
 * Resuelve SEO de página: constants/seo.js + override opcional desde seoBlock CMS.
 */
export function resolvePageSeoConfig(pageKey, extensions) {
  const base = getPageSeo(pageKey) ?? {}
  const cmsSeo = enrichSeoSectionForRuntime(
    getActiveSeoSection(extensions),
    extensions?.heroSection,
  )
  if (!cmsSeo) return base
  return mergePageSeo(base, cmsSeo)
}

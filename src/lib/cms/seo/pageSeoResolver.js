import { getPageSeo } from '@/constants/seo'
import { mergePageSeo } from '@/lib/cms/contracts/seoBlockContract'
import { getActiveSeoSection } from '@/lib/cms/resolvers/seoBlockResolver'

/**
 * Resuelve SEO de página: constants/seo.js + override opcional desde seoBlock CMS.
 */
export function resolvePageSeoConfig(pageKey, extensions) {
  const base = getPageSeo(pageKey) ?? {}
  const cmsSeo = getActiveSeoSection(extensions)
  if (!cmsSeo) return base
  return mergePageSeo(base, cmsSeo)
}

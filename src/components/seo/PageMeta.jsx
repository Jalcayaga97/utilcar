import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE } from '@/constants/site'
import {
  buildCanonical,
  buildPageTitle,
  getPageSeo,
} from '@/constants/seo'
import { mergePageSeo } from '@/lib/cms/contracts/seoBlockContract'

function upsertMetaByName(name, content) {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaByProperty(property, content) {
  if (!content) return
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * SEO por página.
 * @param {string} [page] — clave en PAGE_SEO (recomendado)
 * @param {string} [title] — override de título corto
 * @param {string} [description] — override de descripción
 * @param {string} [path] — override de ruta para canonical
 * @param {string} [keywords] — override de keywords
 * @param {string} [image] — override de og:image (URL absoluta)
 * @param {boolean} [noindex]
 * @param {object} [cmsSeo] — override desde seoBlock CMS (extensions.seoSection)
 */
export function PageMeta({
  page,
  title,
  description,
  path,
  keywords,
  image,
  noindex = false,
  cmsSeo,
}) {
  const location = useLocation()
  const baseConfig = page ? getPageSeo(page) : null
  const config = cmsSeo ? mergePageSeo(baseConfig ?? {}, cmsSeo) : baseConfig

  const seoTitle = title ?? config?.title ?? null
  const seoDescription = description ?? config?.description ?? SITE.description
  const seoKeywords = keywords ?? config?.keywords ?? ''
  const seoPath = path ?? config?.path ?? location.pathname
  const seoNoindex = noindex || config?.noindex === true
  const seoImage = image ?? config?.ogImage ?? SITE.ogImage

  const fullTitle = buildPageTitle(seoTitle)
  const canonical = buildCanonical(seoPath)
  const ogUrl = buildCanonical(location.pathname)

  useEffect(() => {
    document.title = fullTitle
    document.documentElement.lang = 'es'

    upsertMetaByName('description', seoDescription)
    upsertMetaByName('keywords', seoKeywords)
    upsertMetaByName('robots', seoNoindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', canonical)

    upsertMetaByProperty('og:title', fullTitle)
    upsertMetaByProperty('og:description', seoDescription)
    upsertMetaByProperty('og:image', seoImage)
    upsertMetaByProperty('og:image:width', String(SITE.ogImageWidth))
    upsertMetaByProperty('og:image:height', String(SITE.ogImageHeight))
    upsertMetaByProperty('og:image:alt', `${SITE.name} — conversiones automotrices Santiago`)
    upsertMetaByProperty('og:type', 'website')
    upsertMetaByProperty('og:url', ogUrl)
    upsertMetaByProperty('og:locale', SITE.locale)
    upsertMetaByProperty('og:site_name', SITE.name)

    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:title', fullTitle)
    upsertMetaByName('twitter:description', seoDescription)
    upsertMetaByName('twitter:image', seoImage)
  }, [
    fullTitle,
    seoDescription,
    seoKeywords,
    canonical,
    ogUrl,
    seoImage,
    seoNoindex,
  ])

  return null
}

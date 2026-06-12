import { pickImageUrl, pickImageAlt, normalizeGalleryImages, isValidImageUrl } from '@/lib/cms/assets/resolveImage'

function safeString(value, fallback = '') {
  if (value == null) return fallback
  const s = String(value).trim()
  return s || fallback
}

/**
 * Párrafos introductorios del tab — solo datos CMS (raw tab).
 * `description` es «Descripción breve» en Studio; `intro[]` son párrafos extendidos.
 * Cuando el editor actualiza description, debe reflejarse aunque intro[] conserve seed antiguo.
 */
export function resolveServiceTabIntro(raw = {}) {
  const description = safeString(raw.description)
  const paragraphs = (raw.intro ?? [])
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .map((p) => safeString(p))
    .filter(Boolean)

  if (description) {
    const tail = paragraphs.filter((p) => p !== description)
    return [description, ...tail]
  }

  return paragraphs
}

export function normalizeServiceTab(raw = {}, index = 0) {
  const id = safeString(raw.id, `tab-${index}`)
  const gallery = normalizeGalleryImages(
    (raw.gallery ?? []).map((item, i) => ({
      image: item?.image,
      alt: item?.alt || item?.caption,
      id: `${id}-gallery-${i}`,
    })),
    [],
  )

  return {
    id,
    name: safeString(raw.name, id),
    description: safeString(raw.description),
    models: (raw.models ?? []).map((m) => safeString(m)).filter(Boolean),
    subtitle: safeString(raw.subtitle),
    intro: resolveServiceTabIntro(raw),
    sections: (raw.sections ?? []).map((section) => ({
      title: safeString(section?.title),
      items: (section?.items ?? []).map((item) => safeString(item)).filter(Boolean),
    })),
    gallery,
    extra: raw.extra
      ? {
          title: safeString(raw.extra.title),
          lead: safeString(raw.extra.lead),
          brands: (raw.extra.brands ?? []).map((b) => safeString(b)).filter(Boolean),
          closing: safeString(raw.extra.closing),
        }
      : null,
  }
}

export function normalizeServiceTabs(tabs = []) {
  return tabs.map((tab, index) => normalizeServiceTab(tab, index))
}

export function tabGalleryToDisplayImages(tab) {
  const brandName = tab?.name ?? ''
  return (tab?.gallery ?? [])
    .map((item, index) => {
      const src =
        (typeof item?.src === 'string' && isValidImageUrl(item.src) ? item.src : null) ||
        (typeof item?.url === 'string' && isValidImageUrl(item.url) ? item.url : null) ||
        pickImageUrl(item?.image) ||
        pickImageUrl(item)

      if (!src) return null

      return {
        src,
        alt: item?.alt || pickImageAlt(item?.image ?? item, brandName),
        id: item?.id || `${tab?.id ?? 'tab'}-${index}`,
      }
    })
    .filter(Boolean)
}

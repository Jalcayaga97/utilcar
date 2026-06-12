import { pickImageAlt, pickImageUrl } from '@/lib/cms/assets/resolveImage'
import { getWebpSrc } from '@/lib/images/webpRegistry'

export function brandCarouselSectionContract(block) {
  if (!block) return null
  return {
    eyebrow: block.eyebrow ?? '',
    title: block.title ?? '',
    description: block.description ?? '',
    brands: Array.isArray(block.brands) ? block.brands : [],
  }
}

function isSvgLogo(item, src) {
  const extension = String(item?.logo?.asset?.extension ?? '').toLowerCase()
  if (extension === 'svg') return true
  return /\.svg($|\?)/i.test(String(src ?? ''))
}

export function mapBrandCarouselBrands(brands = []) {
  if (!Array.isArray(brands)) return []
  return brands
    .filter((item) => item?.active !== false)
    .map((item, index) => {
      const src = pickImageUrl(item?.logo)
      if (!src) return null
      const name = String(item?.name ?? '').trim()
      if (!name) return null
      const alt = pickImageAlt(item?.logo, name)
      const isSvg = isSvgLogo(item, src)
      return {
        id: item?._key ?? `brand-${index}`,
        name,
        src,
        webpSrc: isSvg ? null : getWebpSrc(src),
        isSvg,
        alt: String(alt).trim() || name,
        website: String(item?.website ?? '').trim() || null,
      }
    })
    .filter(Boolean)
}

import { pickImageAlt, pickImageUrl } from '@/lib/cms/assets/resolveImage'
import { getWebpSrc } from '@/lib/images/webpRegistry'

export function showcaseCarouselSectionContract(block) {
  if (!block) return null
  return {
    eyebrow: block.eyebrow ?? '',
    title: block.title ?? '',
    description: block.description ?? '',
    images: Array.isArray(block.images) ? block.images : [],
  }
}

export function mapShowcaseCarouselImages(images = []) {
  if (!Array.isArray(images)) return []
  return images
    .map((item, index) => {
      const src = pickImageUrl(item?.image)
      if (!src) return null
      const alt = pickImageAlt(item?.image, item?.alt || item?.caption || '')
      if (!String(alt).trim()) return null
      return {
        id: item?._key ?? `showcase-${index}`,
        src,
        webpSrc: getWebpSrc(src),
        alt: String(alt).trim(),
        title: item?.title ?? '',
        caption: item?.caption ?? '',
      }
    })
    .filter(Boolean)
}

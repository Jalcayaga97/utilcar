import {
  isValidServiceCategory,
  labelForServiceCategory,
} from '@/lib/cms/constants/serviceCategories'
import { pickImageAlt, pickImageUrl } from '@/lib/cms/assets/resolveImage'

export function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function normalizeWorkProjectId(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') return sanitizeString(raw)
  return sanitizeString(raw.current ?? raw)
}

/**
 * @param {object | null | undefined} raw
 */
export function normalizeWorkProject(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = normalizeWorkProjectId(raw.id ?? raw.projectId)
  const serviceCategory = sanitizeString(raw.serviceCategory)
  if (!id || !sanitizeString(raw.title)) return null

  const imageUrl = pickImageUrl(raw.image)
  const gallery = (raw.gallery ?? [])
    .map((entry, index) => {
      const url = pickImageUrl(entry?.image)
      if (!url) return null
      return {
        src: url,
        alt: pickImageAlt(entry?.image, entry?.alt || entry?.caption || ''),
        id: entry?._key || `gallery-${index}`,
      }
    })
    .filter(Boolean)

  return {
    id,
    _id: raw._id ?? null,
    title: sanitizeString(raw.title),
    serviceCategory,
    category: labelForServiceCategory(serviceCategory),
    categoryId: serviceCategory,
    description: sanitizeString(raw.description),
    client: sanitizeString(raw.client),
    vehicle: sanitizeString(raw.vehicle),
    image: imageUrl,
    imageUrl,
    imageAlt: pickImageAlt(raw.image, raw.title),
    gallery,
    featured: Boolean(raw.featured),
    homeVisible: Boolean(raw.homeVisible),
    visible: raw.visible !== false,
    order: Number(raw.order) || 0,
    categoryValid: isValidServiceCategory(serviceCategory),
  }
}

export function normalizeWorkProjectList(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => normalizeWorkProject(item))
    .filter((item) => item && item.visible !== false)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

import { getServiceImage } from '@/assets/images'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

/**
 * Resuelve imagen de tarjeta servicio: CMS → legacy por id → none.
 * @param {{ id?: string, image?: { url?: string | null, alt?: string } } | null} contractItem
 * @param {{ id?: string, imageAlt?: string } | null} [legacyService]
 */
export function resolveServiceAssets(contractItem, legacyService = {}) {
  const cmsUrl = contractItem?.image?.url ?? null
  const serviceId = legacyService?.id ?? contractItem?.id
  const legacyUrl = serviceId ? getServiceImage(serviceId) : null

  let source = 'none'
  let src = null

  if (cmsUrl) {
    src = cmsUrl
    source = 'cms'
  } else if (legacyUrl) {
    src = legacyUrl
    source = 'legacy'
  }

  const alt =
    contractItem?.image?.alt ||
    legacyService?.imageAlt ||
    contractItem?.title ||
    ''

  logAssetsDomain('service', {
    source,
    serviceId: serviceId ?? null,
    hasCmsUrl: Boolean(cmsUrl),
  })

  return { src, alt, source }
}

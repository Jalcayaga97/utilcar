import { IMAGES } from '@/assets/images'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

/**
 * Resuelve imagen del hero: CMS → legacy local → default.
 * @param {{ image?: { url?: string | null, alt?: string } } | null} heroContract
 * @param {{ imageAlt?: string } | null} [legacyHero]
 */
export function resolveHeroAssets(heroContract, legacyHero = {}) {
  const cmsUrl = heroContract?.image?.url ?? null
  const legacyUrl = IMAGES.hero ?? null
  const defaultUrl = legacyUrl

  let source = 'default'
  let src = defaultUrl

  if (cmsUrl) {
    src = cmsUrl
    source = 'cms'
  } else if (legacyUrl) {
    src = legacyUrl
    source = 'legacy'
  }

  const alt =
    heroContract?.image?.alt ||
    legacyHero?.imageAlt ||
    ''

  logAssetsDomain('hero', {
    source,
    hasCmsUrl: Boolean(cmsUrl),
    hasLegacyUrl: Boolean(legacyUrl),
  })

  return { src, alt, source }
}

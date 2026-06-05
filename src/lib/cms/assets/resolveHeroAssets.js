import { IMAGES } from '@/assets/images'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

/**
 * Resuelve imagen del hero: CMS → legacy local → default.
 * @param {{ image?: { url?: string | null, alt?: string } } | null} heroContract
 * @param {{ imageAlt?: string } | null} [legacyHero]
 * @param {string} [pageKey='home']
 */
export function resolveHeroAssets(heroContract, legacyHero = {}, pageKey = 'home') {
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

  if (import.meta.env.DEV) {
    console.info('[home-hero]', {
      pageKey,
      imageSource: source,
      resolvedUrl: src?.startsWith('data:') ? '(placeholder)' : src,
      hasCmsUrl: Boolean(cmsUrl),
    })
    if (source !== 'cms' && pageKey === 'home') {
      console.warn(
        `[home-hero] ${pageKey}: imagen no viene del CMS — suba heroBlock.image en Studio o ejecute npm run migrate:home`,
      )
    }
  }

  return { src, alt, source }
}

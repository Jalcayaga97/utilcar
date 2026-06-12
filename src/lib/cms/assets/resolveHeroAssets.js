import { IMAGES } from '@/assets/images'
import { BRAND } from '@/constants/site'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

function resolveImageSlot(cmsImage, { legacyAlt = '', fallbackUrl = null, fallbackAlt = '' } = {}) {
  const cmsUrl = cmsImage?.url ?? null
  let source = 'default'
  let src = fallbackUrl

  if (cmsUrl) {
    src = cmsUrl
    source = 'cms'
  } else if (fallbackUrl) {
    source = 'fallback'
  }

  const alt = cmsImage?.alt || legacyAlt || fallbackAlt

  return { src, alt, source, hasImage: Boolean(src) }
}

/**
 * Resuelve imagen del hero en páginas de servicio: CMS → legacy local → default.
 * @param {{ image?: { url?: string | null, alt?: string } } | null} heroContract
 * @param {{ imageAlt?: string } | null} [legacyHero]
 * @param {string} [pageKey='home']
 */
export function resolveHeroAssets(heroContract, legacyHero = {}, pageKey = 'home') {
  const cmsUrl = heroContract?.image?.url ?? heroContract?.primaryImage?.url ?? null
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
    heroContract?.primaryImage?.alt ||
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
        `[home-hero] ${pageKey}: imagen no viene del CMS — suba heroBlock.primaryImage en Studio o ejecute npm run repair:home-hero-layout`,
      )
    }
  }

  return { src, alt, source }
}

/**
 * Imágenes duales del hero Home: logo corporativo + distintivo.
 */
export function resolveHomeHeroImages(heroSection, legacyHero = {}) {
  const primary = resolveImageSlot(heroSection?.primaryImage ?? heroSection?.image, {
    legacyAlt: legacyHero?.primaryImageAlt ?? legacyHero?.imageAlt,
    fallbackUrl: BRAND.logo,
    fallbackAlt: BRAND.logoAlt,
  })

  const secondary = resolveImageSlot(heroSection?.secondaryImage, {
    legacyAlt: legacyHero?.secondaryImageAlt,
    fallbackUrl: null,
    fallbackAlt: 'Distintivo Utilcar — años en el mercado',
  })

  logAssetsDomain('home-hero-dual', {
    primarySource: primary.source,
    secondarySource: secondary.source,
    hasSecondary: secondary.hasImage,
  })

  return { primary, secondary }
}

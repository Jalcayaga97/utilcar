import * as si from 'simple-icons'
import { svgFromCustomContent, svgFromSimpleIcon } from './normalizeBrandSvg.mjs'

const SI = Object.fromEntries(
  Object.values(si)
    .filter((entry) => entry?.slug)
    .map((entry) => [entry.slug, entry]),
)

/** @typedef {{ name: string, slug: string, file: string }} BrandLogoEntry */

/** Logos personalizados (wordmarks) — fondo transparente, colores oficiales. */
const CUSTOM_SVGS = {
  dodge: svgFromCustomContent({
    title: 'Dodge',
    inner: `<text x="120" y="48" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="36" font-weight="900" fill="#CE1126" letter-spacing="4">DODGE</text>`,
  }),
  freightliner: svgFromCustomContent({
    title: 'Freightliner',
    inner: `<text x="120" y="44" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#003B71" letter-spacing="1">Freightliner</text>`,
  }),
  mack: svgFromCustomContent({
    title: 'Mack',
    inner: `<text x="120" y="50" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="40" font-weight="900" fill="#C5A000" letter-spacing="6">MACK</text>`,
  }),
  kyc: svgFromCustomContent({
    title: 'KYC',
    inner: `<rect x="52" y="18" width="136" height="44" rx="6" fill="none" stroke="#1B3A6B" stroke-width="3"/>
<text x="120" y="50" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="32" font-weight="900" fill="#1B3A6B" letter-spacing="6">KYC</text>`,
  }),
  kaufmann: svgFromCustomContent({
    title: 'Kaufmann',
    inner: `<text x="120" y="44" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#003DA5" letter-spacing="1">KAUFMANN</text>
<text x="120" y="62" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="600" fill="#003DA5" letter-spacing="3">TRUCKS &amp; BUSES</text>`,
  }),
  transvip: svgFromCustomContent({
    title: 'Transvip',
    inner: `<text x="120" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#E85D24" letter-spacing="1">Transvip</text>`,
  }),
  gesvial: svgFromCustomContent({
    title: 'Gesvial',
    inner: `<text x="120" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#2E7D32" letter-spacing="2">GESVIAL</text>`,
  }),
  'grupo-norte': svgFromCustomContent({
    title: 'Grupo Norte',
    inner: `<text x="120" y="40" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#1A365D" letter-spacing="2">GRUPO</text>
<text x="120" y="62" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" fill="#1A365D" letter-spacing="3">NORTE</text>`,
  }),
}

const SIMPLE_ICON_SLUGS = {
  Chevrolet: 'chevrolet',
  DAF: 'daf',
  Fiat: 'fiat',
  Kia: 'kia',
  Mitsubishi: 'mitsubishi',
  Renault: 'renault',
  Toyota: 'toyota',
}

const CUSTOM_SLUGS = {
  Dodge: 'dodge',
  Freightliner: 'freightliner',
  Mack: 'mack',
  KYC: 'kyc',
  Kaufmann: 'kaufmann',
  Transvip: 'transvip',
  Gesvial: 'gesvial',
  'Grupo Norte': 'grupo-norte',
}

/** 15 marcas oficiales Home — orden CMS. */
export const BRAND_NAMES = [
  'Chevrolet',
  'DAF',
  'Dodge',
  'Fiat',
  'Freightliner',
  'Kia',
  'KYC',
  'Mack',
  'Mitsubishi',
  'Renault',
  'Toyota',
  'Kaufmann',
  'Transvip',
  'Gesvial',
  'Grupo Norte',
]

export const PLACEHOLDER_FILENAME = 'logo.jpg'

/**
 * @param {string} name
 * @returns {string | null}
 */
export function buildBrandSvgContent(name) {
  const simpleSlug = SIMPLE_ICON_SLUGS[name]
  if (simpleSlug && SI[simpleSlug]) {
    return svgFromSimpleIcon(SI[simpleSlug])
  }
  const customSlug = CUSTOM_SLUGS[name]
  if (customSlug && CUSTOM_SVGS[customSlug]) {
    return CUSTOM_SVGS[customSlug]
  }
  return null
}

/**
 * @returns {BrandLogoEntry[]}
 */
export function buildBrandLogoCatalog(webRoot) {
  return BRAND_NAMES.map((name) => {
    const slug =
      CUSTOM_SLUGS[name] ??
      SIMPLE_ICON_SLUGS[name] ??
      name.toLowerCase().replace(/\s+/g, '-')
    return {
      name,
      slug,
      file: `${webRoot}/public/brands/${slug}.svg`,
    }
  })
}

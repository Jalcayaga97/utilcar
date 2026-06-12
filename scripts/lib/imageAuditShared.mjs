import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  SERVICE_SUB_PAGE_TAB_KEYS,
  serviceSubPageDocumentId,
} from '../../utilcar-studio/schemas/content/serviceSubPage.js'
import { INPUT_EXT } from '../webp-utils.js'

export { SERVICE_SUB_PAGE_KEYS, SERVICE_SUB_PAGE_TAB_KEYS, serviceSubPageDocumentId }

/** Fallback SEO local (mirror de src/constants/seo.js — sin alias @/). */
export const SERVICE_LOCAL_SEO = {
  'talleres-moviles': {
    path: '/talleres-moviles',
    title: 'Talleres móviles y conversiones en terreno',
    description:
      'Conversión de furgones y utilitarios en talleres móviles, bibliotecas y oficinas técnicas. Mobiliario, electricidad y terminaciones profesionales en Santiago.',
  },
  'ventanas-lunetas': {
    path: '/ventanas-lunetas',
    title: 'Ventanas y lunetas para furgones',
    description:
      'Fabricación e instalación de ventanas corredizas y lunetas para furgones y minibuses. Toyota, Peugeot, Renault, Fiat, Citroën, Chevrolet y más marcas.',
  },
  'equipamiento-escolar': {
    path: '/equipamiento-escolar',
    title: 'Equipamiento escolar y buses',
    description:
      'Equipamiento de buses escolares según normativa de transporte: butacas homologadas, señalética, balizas y terminaciones. Utilcar, Santiago.',
  },
  banquetas: {
    path: '/banquetas',
    title: 'Banquetas para minibús y transporte',
    description:
      'Fabricación de banquetas para minibús, traslado de personal y transporte escolar. Estructura reforzada, tapizados técnicos y cinturones en Santiago.',
  },
  butacas: {
    path: '/butacas',
    title: 'Butacas a medida para transporte',
    description:
      'Butacas ergonómicas para flotas, turismo y vehículos especiales. Matrices propias, tapizados premium e instalación certificada en Santiago.',
  },
  accesorios: {
    path: '/accesorios',
    title: 'Accesorios para conversiones vehiculares',
    description:
      'Cabeceras, apoya brazos, balizas y distintivo escolar para vans y buses. Accesorios de confort, seguridad y señalización — Utilcar Santiago.',
  },
  'proteccion-cabina': {
    path: '/proteccion-cabina',
    title: 'Protección de cabina para vehículos',
    description:
      'Protección interior de cabina para furgones y utilitarios. Revestimientos resistentes y terminaciones profesionales en Santiago — Utilcar.',
  },
  'cambio-pisos': {
    path: '/cambio-pisos',
    title: 'Cambio de pisos para vehículos comerciales',
    description:
      'Instalación y renovación de pisos técnicos en minibuses, furgones y vehículos especiales. Utilcar Conversiones, Santiago.',
  },
  reclinaciones: {
    path: '/reclinaciones',
    title: 'Reclinaciones para butacas y banquetas',
    description:
      'Instalación de mecanismos reclinables en butacas y banquetas para transporte ejecutivo y turismo. Utilcar, Santiago.',
  },
  fundas: {
    path: '/fundas',
    title: 'Fundas para asientos de vehículos',
    description:
      'Fundas a medida para butacas y banquetas. Protección, uniformidad de flota y fácil mantenimiento — Utilcar Santiago.',
  },
  literas: {
    path: '/literas',
    title: 'Literas para vehículos comerciales',
    description:
      'Fabricación e instalación de literas para furgones y vehículos especiales. Estructura reforzada y anclajes seguros — Utilcar.',
  },
  tapiceria: {
    path: '/tapiceria',
    title: 'Tapicería vehicular',
    description:
      'Cambio de tapiz, reparación y personalización interior para vehículos comerciales. Tapicería profesional en Santiago — Utilcar.',
  },
}

export function getServiceLocalSeo(pageKey) {
  return SERVICE_LOCAL_SEO[pageKey] ?? null
}

export const SITE_DEFAULT_OG_IMAGE = (() => {
  const base = String(process.env.VITE_SITE_URL || 'https://www.utilcar.cl').replace(/\/$/, '')
  return `${base}/og-image.jpg`
})()

export function resolveSocialImageUrlAudit({
  seoOgImageUrl = null,
  heroImageUrl = null,
  defaultOgImage = SITE_DEFAULT_OG_IMAGE,
} = {}) {
  return seoOgImageUrl || heroImageUrl || defaultOgImage || null
}

export const MIN_SERVICE_PORTFOLIO_PROJECTS = 3

export const HERO_FALLBACK_FILES = {
  'talleres-moviles': 'src/assets/images/talleres/tr143.jpg',
  'ventanas-lunetas': 'src/assets/images/ventanas/vent3.jpg',
  'equipamiento-escolar': 'src/assets/images/escolar/ee350.jpg',
  banquetas: 'src/assets/images/services/banquetas.jpg',
  butacas: 'src/assets/images/butacas/IMG_0148.jfif',
  accesorios: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg',
  'proteccion-cabina': 'src/assets/images/butacas/IMG_0148.jfif',
  'cambio-pisos': 'src/assets/images/services/banquetas.jpg',
  reclinaciones: 'src/assets/images/butacas/IMG_0149.jfif',
  fundas: 'src/assets/images/services/banquetas.jpg',
  literas: 'src/assets/images/services/banquetas.jpg',
  tapiceria: 'src/assets/images/butacas/IMG_0150.jfif',
}

export function createAuditClient() {
  const env = loadSanityEnv({ requireToken: false })
  env.applyToProcessEnv()
  return createClient({
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion: '2024-05-28',
    useCdn: false,
  })
}

export function imageFormatFromUrl(url) {
  if (!url || typeof url !== 'string') return 'unknown'
  const path = url.split('?')[0].toLowerCase()
  if (path.endsWith('.webp')) return 'webp'
  if (path.endsWith('.jpeg')) return 'jpeg'
  if (path.endsWith('.jpg')) return 'jpg'
  if (path.endsWith('.png')) return 'png'
  if (path.endsWith('.jfif')) return 'jpeg'
  const fm = new URL(url, 'https://local').searchParams.get('fm')
  if (fm) return fm.toLowerCase()
  return 'unknown'
}

export function isValidHttpUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url.startsWith('data:image/')) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatCounts(counts) {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}: ${n}`)
    .join('\n')
}

export function estimateWebpSavingsBytes(originalBytes) {
  if (!originalBytes) return 0
  return Math.round(originalBytes * 0.35)
}

const LOCAL_RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.jfif', '.webp'])

export async function collectLocalRasterFiles(dir, skipDirNames = new Set(), files = []) {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skipDirNames.has(entry.name)) continue
      await collectLocalRasterFiles(fullPath, skipDirNames, files)
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (LOCAL_RASTER_EXT.has(ext)) files.push(fullPath)
  }
  return files
}

export function extFromPath(filePath) {
  const ext = filePath.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'jpg') return 'jpg'
  if (ext === 'jpeg' || ext === 'jfif') return 'jpeg'
  if (ext === 'png') return 'png'
  if (ext === 'webp') return 'webp'
  return 'other'
}

export const RASTER_EXT = INPUT_EXT

export const SERVICE_IMAGE_QUERY = `*[_type == "serviceSubPage" && !(_id in path("drafts.**"))]{
  _id, pageKey, title,
  blocks[]{
    _type, _key, imageAlt,
    title, description, canonicalPath, keywords, noindex,
    ogImage{ alt, asset->{ _id, url, size, extension, metadata } },
    image{ alt, asset->{ _id, url, size, extension, metadata } },
    items[]{
      title, subtitle, description,
      image{ alt, asset->{ _id, url, size, extension } }
    }
  },
  tabs[]{
    _key, id, name,
    gallery[]{ _key, alt, caption, image{ asset->{ _id, url, size, extension } } }
  }
}`

export const WORK_PROJECTS_BY_CATEGORY = `*[_type == "workProject" && serviceCategory == $category]{
  _id, projectId, title,
  image{ alt, asset->{ _id, url, size, extension } }
}`

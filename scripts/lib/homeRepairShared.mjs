/**
 * Datos y utilidades compartidas para migración/reparación de homePage.
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { loadSanityEnv } from '../../src/lib/sanity/runtime/loadSanityEnv.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const WEB_ROOT = join(__dirname, '../..')

const seed = JSON.parse(
  readFileSync(join(WEB_ROOT, 'utilcar-studio/seed/minimal-content.json'), 'utf8'),
)
export const homeContent = seed.homePage

export const TRABAJOS_PREVIEW_IDS = ['1', '2', '3']

import {
  SERVICE_ENTRIES,
  SERVICE_LINKS_MANIFEST,
  EXPECTED_SERVICE_COUNT,
} from './serviceCatalogManifest.mjs'

export { SERVICE_ENTRIES, SERVICE_LINKS_MANIFEST, EXPECTED_SERVICE_COUNT }

const ESPECIALIDADES = homeContent.especialidades?.items ?? []
const SPECIALTY_IMAGES = {
  furgones: 'src/assets/images/ventanas/vent2.jpg',
  escolar: 'src/assets/images/services/escolar.jpg',
  banquetas: 'src/assets/images/services/banquetas.jpg',
}

export const WHY_US_ITEMS = [
  {
    title: 'Ingeniería propia',
    description: 'Diseño y fabricación con control de calidad en cada etapa del proceso.',
    icon: 'award',
  },
  {
    title: 'A medida por vehículo',
    description: 'Soluciones adaptadas a marca, modelo y uso operativo de su flota.',
    icon: 'users',
  },
  {
    title: 'Instalación certificada',
    description: 'Taller especializado con protocolos de montaje y terminación premium.',
    icon: 'check-circle',
  },
]

/** Vista previa home (legacy work.js ids 1–3) para workPage.preview */
export const WORK_PREVIEW_LEGACY = [
  {
    id: '1',
    title: 'Flota escolar Mercedes Sprinter',
    category: 'Equipamiento escolar',
    description:
      'Conversión integral con butacas homologadas y señalética reglamentaria.',
    imageAlt:
      'Bus escolar Mercedes Sprinter con equipamiento homologado y butacas instaladas por Utilcar',
    imageKey: 1,
  },
  {
    id: '2',
    title: 'Taller móvil Toyota Hiace',
    category: 'Talleres móviles',
    description:
      'Interior técnico con bancada, electricidad 12/220V y organizadores modulares.',
    imageAlt:
      'Toyota Hiace convertido en taller móvil con mobiliario técnico y electricidad en terreno',
    imageKey: 2,
  },
  {
    id: '3',
    title: 'Ventanas Renault Master',
    category: 'Ventanas y lunetas',
    description: 'Kit de cuatro ventiletes con luneta trasera y terminación sellada.',
    imageAlt:
      'Ventanas laterales corredizas para furgón Renault Master — kit de ventiletes Utilcar',
    imageKey: 3,
  },
]

export function createKey() {
  return randomUUID().replace(/-/g, '').slice(0, 12)
}

export function ensureArrayKeys(arr) {
  if (!Array.isArray(arr)) return arr
  return arr.map((item) => {
    if (!item || typeof item !== 'object') return item
    return { ...item, _key: item._key || createKey() }
  })
}

function fileStat(relativePath) {
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) return { exists: false, abs }
  return { exists: true, abs, size: statSync(abs).size }
}

export function createImageUploader(client, cache, stats) {
  return async (relativePath, alt) => {
    if (!relativePath) return null
    if (!client) {
      const stat = fileStat(relativePath)
      if (!stat.exists) {
        stats.missing.push(relativePath)
        return null
      }
      stats.wouldUpload += 1
      return { _type: 'image', alt: alt || basename(relativePath), _verifyOnly: true }
    }
    if (cache.has(relativePath)) return cache.get(relativePath)
    const stat = fileStat(relativePath)
    if (!stat.exists) {
      stats.missing.push(relativePath)
      return null
    }
    const asset = await client.assets.upload('image', createReadStream(stat.abs), {
      filename: basename(stat.abs),
    })
    const ref = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: alt || basename(stat.abs),
    }
    cache.set(relativePath, ref)
    stats.uploaded += 1
    return ref
  }
}

export function mapSpecialtyCategory(item, heroImage) {
  const features = (item.specGroups ?? []).map((group) => ({
    _type: 'specialtyFeature',
    _key: createKey(),
    title: group.title,
    items: group.items ?? [],
    kind: 'spec',
  }))
  return {
    _type: 'specialtyCategory',
    _key: createKey(),
    title: item.title,
    subtitle: item.subtitle ?? '',
    description: (item.intro ?? '').slice(0, 500),
    slug: { _type: 'slug', current: item.id },
    heroImage,
    heroImageAlt: item.imageAlt ?? item.title,
    features,
    cta: {
      label: item.cta?.label ?? '',
      to: item.cta?.path ?? '',
      ariaLabel: item.cta?.label ?? '',
    },
    enabled: true,
  }
}

export async function buildServiceItems(uploadImage, cardLinkLabel) {
  const label = cardLinkLabel || homeContent.services?.cardLinkLabel || 'Ver más'
  const items = []
  for (const entry of SERVICE_ENTRIES) {
    const image = await uploadImage(entry.file, entry.imageAlt)
    items.push({
      _type: 'serviceBlockItem',
      _key: createKey(),
      title: entry.title,
      description: entry.description,
      icon: entry.icon,
      image,
      link: { label, path: entry.path },
    })
  }
  return items
}

export async function buildSpecialtyCategories(uploadImage) {
  const categories = []
  for (const item of ESPECIALIDADES) {
    const imagePath = SPECIALTY_IMAGES[item.id]
    const heroImage = imagePath ? await uploadImage(imagePath, item.imageAlt) : null
    categories.push(mapSpecialtyCategory(item, heroImage))
  }
  return categories
}

export function buildWhyUtilcarBlock(existing = {}) {
  return {
    _type: 'whyUtilcarBlock',
    _key: existing._key || createKey(),
    enabled: existing.enabled !== false,
    order: existing.order ?? 3,
    sectionEyebrow: existing.sectionEyebrow ?? homeContent.highlights?.eyebrow ?? 'Por qué Utilcar',
    sectionTitle: existing.sectionTitle ?? homeContent.highlights?.title ?? '',
    sectionDescription: existing.sectionDescription ?? '',
    items: (existing.items?.length >= 3
      ? existing.items
      : WHY_US_ITEMS.map((item) => ({
          _type: 'whyUsBlockItem',
          _key: createKey(),
          ...item,
        }))),
  }
}

export function buildFeaturedProjects(projectIds = TRABAJOS_PREVIEW_IDS) {
  return projectIds.map((projectId) => ({
    _type: 'featuredProjectRef',
    _key: createKey(),
    projectId: String(projectId),
  }))
}

export function findBlockIndex(blocks, type) {
  return (blocks ?? []).findIndex((block) => block?._type === type)
}

export function findPortfolioBlockIndex(blocks) {
  return (blocks ?? []).findIndex(
    (block) => block?._type === 'portfolioBlock' || block?._type === 'galleryBlock',
  )
}

export function normalizePortfolioBlock(block, featuredProjects) {
  const base = {
    ...block,
    _type: 'portfolioBlock',
    enabled: block?.enabled !== false,
    eyebrow: block?.eyebrow ?? homeContent.portfolioPreview?.eyebrow,
    title: block?.title ?? homeContent.portfolioPreview?.title,
    description: block?.description ?? homeContent.portfolioPreview?.description,
    ctaLabel: block?.ctaLabel ?? homeContent.portfolioPreview?.ctaLabel,
    ctaTo: block?.ctaTo ?? homeContent.portfolioPreview?.ctaTo,
    previewCount: block?.previewCount ?? homeContent.portfolioPreview?.previewCount ?? 3,
    items: [],
  }
  if (!base.featuredProjects?.length && featuredProjects?.length) {
    base.featuredProjects = featuredProjects
  }
  return base
}

export function createRepairClient({ dryRun = false } = {}) {
  const sanityEnv = loadSanityEnv({ requireToken: !dryRun })
  sanityEnv.applyToProcessEnv()
  const client = createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: '2024-05-28',
    token: sanityEnv.token,
    useCdn: false,
  })
  return { client, sanityEnv }
}

export async function fetchHomePage(client) {
  return client.fetch(`*[_id == "homePage"][0]`)
}

export async function fetchWorkPage(client) {
  return client.fetch(`*[_id == "workPage"][0]`)
}

export function normalizeCtaBlock(block) {
  if (!block) return block
  const {
    buttonLabel: _bl,
    buttonLink: _bLink,
    buttonText: _bt,
    primaryLabel: _pl,
    primaryTo: _pt,
    ...rest
  } = block
  return rest
}

export async function normalizeHeroBlock(block, uploadImage) {
  if (!block) return block
  const link = block.secondaryLink ?? homeContent.hero?.secondaryLink
  let next = {
    ...block,
    textLinkLabel: block.textLinkLabel ?? link?.label ?? 'Ver trabajos realizados',
    textLinkUrl: block.textLinkUrl ?? link?.to ?? '/trabajos-realizados',
    imageAlt: block.imageAlt ?? homeContent.hero?.imageAlt,
  }
  if (!next.image?.asset?._ref && uploadImage) {
    const image = await uploadImage('src/assets/images/hero.jpg', next.imageAlt)
    if (image) next = { ...next, image }
  }
  return next
}

export async function normalizeBlocksForPublish(blocks, uploadImage) {
  const normalized = [...(blocks ?? [])]
  const heroIdx = findBlockIndex(normalized, 'heroBlock')
  if (heroIdx >= 0) {
    normalized[heroIdx] = await normalizeHeroBlock(normalized[heroIdx], uploadImage)
  }
  const ctaIdx = findBlockIndex(normalized, 'ctaBlock')
  if (ctaIdx >= 0) {
    normalized[ctaIdx] = normalizeCtaBlock(normalized[ctaIdx])
  }
  return normalized
}

export async function publishHomePage(client, doc, blocks, extra = {}, uploadImage = null) {
  const normalizedBlocks = await normalizeBlocksForPublish(blocks, uploadImage)
  const next = {
    ...doc,
    blocks: normalizedBlocks,
    highlights: {
      eyebrow: homeContent.highlights?.eyebrow,
      title: homeContent.highlights?.title,
    },
    portfolioPreview: {
      eyebrow: homeContent.portfolioPreview?.eyebrow,
      title: homeContent.portfolioPreview?.title,
      description: homeContent.portfolioPreview?.description,
      ctaLabel: homeContent.portfolioPreview?.ctaLabel,
      ctaTo: homeContent.portfolioPreview?.ctaTo,
      previewCount: homeContent.portfolioPreview?.previewCount ?? 3,
    },
    ctaBanner: {
      title: homeContent.ctaBanner?.title ?? doc.ctaBanner?.title,
      description: homeContent.ctaBanner?.description ?? doc.ctaBanner?.description,
    },
    ...extra,
  }
  await client.createOrReplace({ ...next, _id: 'homePage', _type: 'homePage' })
  return next
}

export function mergePreviewItems(existing = []) {
  const list = [...(existing ?? [])]
  const ids = new Set(list.map((item) => String(item?.id ?? '')).filter(Boolean))
  for (const item of WORK_PREVIEW_LEGACY) {
    if (!ids.has(item.id)) {
      list.push({ ...item, _key: createKey() })
      ids.add(item.id)
    }
  }
  return ensureArrayKeys(list)
}

/**
 * Migra contenido local → Sanity serviceSubPage (6 páginas).
 *
 * Uso (desde utilcar-web):
 *   npm run migrate:services:verify   # checklist previo (sin escribir)
 *   npm run migrate:services:dry      # alias de --verify
 *   npm run migrate:services          # migración real
 *   npm run migrate:services:snapshot # export dataset + migrar
 *
 * Variables: loadSanityEnv() — ver docs/SANITY_RUNTIME_SETUP.md
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { runSanityDatasetExport } from '../src/lib/sanity/runtime/runSanityDatasetExport.js'
import {
  talleresMovilesContent,
  ventanasLunetasContent,
  equipamientoEscolarContent,
  banquetasContent,
  butacasContent,
  accesoriosContent,
  VENTANAS_BRANDS,
  BANQUETAS_CATEGORIES,
  ACCESORIOS_CATEGORIES,
  serviceCtaDefaults,
} from '../src/content/services.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'
import { WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS } from '../src/constants/servicePortfolio.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

const argv = process.argv.slice(2)
const verifyOnly = argv.includes('--verify') || argv.includes('--dry')
const withSnapshot = argv.includes('--snapshot')
const doMigrate = !verifyOnly

const EXPECTED_PAGE_KEYS = SERVICE_SUB_PAGE_KEYS.map((k) => k.value)
const EXPECTED_DOC_IDS = EXPECTED_PAGE_KEYS.map(serviceSubPageDocumentId)

/** tabs.length esperado tras migrar */
const EXPECTED_TAB_COUNTS = {
  'ventanas-lunetas': 7,
  banquetas: 3,
  accesorios: 4,
}

const PAGE_SEO = {
  'talleres-moviles': {
    canonicalPath: '/talleres-moviles',
    title: 'Talleres móviles y conversiones en terreno',
    description:
      'Conversión de furgones y utilitarios en talleres móviles, bibliotecas y oficinas técnicas. Mobiliario, electricidad y terminaciones profesionales en Santiago.',
  },
  'ventanas-lunetas': {
    canonicalPath: '/ventanas-lunetas',
    title: 'Ventanas y lunetas para furgones',
    description:
      'Fabricación e instalación de ventanas corredizas y lunetas para furgones y minibuses. Toyota, Peugeot, Renault, Fiat, Citroën, Chevrolet y más marcas.',
  },
  'equipamiento-escolar': {
    canonicalPath: '/equipamiento-escolar',
    title: 'Equipamiento escolar y buses',
    description:
      'Equipamiento de buses escolares según normativa de transporte: butacas homologadas, señalética, balizas y terminaciones. Utilcar, Santiago.',
  },
  banquetas: {
    canonicalPath: '/banquetas',
    title: 'Banquetas para minibús y transporte',
    description:
      'Fabricación de banquetas para minibús, traslado de personal y transporte escolar. Estructura reforzada, tapizados técnicos y cinturones en Santiago.',
  },
  butacas: {
    canonicalPath: '/butacas',
    title: 'Butacas a medida para transporte',
    description:
      'Butacas ergonómicas para flotas, turismo y vehículos especiales. Matrices propias, tapizados premium e instalación certificada en Santiago.',
  },
  accesorios: {
    canonicalPath: '/accesorios',
    title: 'Accesorios para conversiones vehiculares',
    description:
      'Cabeceras, apoya brazos, balizas y distintivo escolar para vans y buses. Accesorios de confort, seguridad y señalización — Utilcar Santiago.',
  },
}

const HERO_IMAGE_FILES = {
  'talleres-moviles': 'src/assets/images/talleres/tr143.jpg',
  'ventanas-lunetas': 'src/assets/images/ventanas/vent3.jpg',
  'equipamiento-escolar': 'src/assets/images/escolar/ee350.jpg',
  banquetas: 'src/assets/images/services/banquetas.jpg',
  butacas: 'src/assets/images/butacas/IMG_0148.jfif',
  accesorios: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg',
}

const PORTFOLIO_PLACEHOLDERS = {
  client: 'Proyecto Utilcar',
  vehicle: 'Vehículo comercial',
  description: 'Implementación personalizada según requerimientos operacionales.',
}

const PAGE_PORTFOLIO_DEFAULTS = {
  'talleres-moviles': {
    category: 'Talleres móviles',
    client: 'Proyecto Utilcar',
    vehicle: 'Furgón utilitario',
    description: 'Implementación personalizada según requerimientos operacionales.',
  },
  'ventanas-lunetas': {
    category: 'Ventanas y lunetas',
    client: 'Proyecto Utilcar',
    vehicle: 'Minibús / furgón',
    description: 'Implementación personalizada según requerimientos operacionales.',
  },
  'equipamiento-escolar': {
    category: 'Equipamiento escolar',
    client: 'Proyecto Utilcar',
    vehicle: 'Bus escolar',
    description: 'Implementación personalizada según requerimientos operacionales.',
  },
  butacas: {
    category: 'Butacas',
    client: 'Proyecto Utilcar',
    vehicle: 'Transporte de pasajeros',
    description: 'Implementación personalizada según requerimientos operacionales.',
  },
}

const PAGE_GALLERY_FILES = {
  'talleres-moviles': [
    { file: 'src/assets/images/talleres/tr143.jpg', title: 'Taller móvil', alt: 'Taller móvil equipado para trabajo en terreno' },
    { file: 'src/assets/images/talleres/tr247.jpg', title: 'Interior taller móvil', alt: 'Interior de vehículo adaptado como taller móvil' },
    { file: 'src/assets/images/talleres/tr11.jpg', title: 'Conversión furgón', alt: 'Conversión de furgón para servicio técnico móvil' },
    { file: 'src/assets/images/talleres/tr12.jpg', title: 'Compartimientos', alt: 'Unidad móvil con compartimientos interiores' },
    { file: 'src/assets/images/talleres/tr9.jpg', title: 'Revestimiento', alt: 'Vehículo utilitario con revestimiento interior' },
  ],
  'ventanas-lunetas': [
    { file: 'src/assets/images/ventanas/vent1.jpg', title: 'Ventanas corredizas', alt: 'Ventanas laterales corredizas instaladas en furgón utilitario' },
    { file: 'src/assets/images/ventanas/vent2.jpg', title: 'Marco aluminio', alt: 'Ventanas con marco de aluminio electropintado' },
    { file: 'src/assets/images/ventanas/vent3.jpg', title: 'Luneta trasera', alt: 'Luneta trasera y ventiletes con terminación profesional' },
  ],
  'equipamiento-escolar': [
    { file: 'src/assets/images/escolar/ee350.jpg', title: 'Equipamiento escolar', alt: 'Equipamiento escolar — interior de bus' },
    { file: 'src/assets/images/escolar/ee351.jfif', title: 'Distribución interior', alt: 'Conversión escolar — distribución de asientos' },
    { file: 'src/assets/images/escolar/ee352.jpg', title: 'Señalética', alt: 'Transporte escolar — instalación y señalética' },
  ],
  butacas: [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', title: 'Butacas Utilcar', alt: 'Butacas Utilcar — tapizado y terminaciones' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', title: 'Detalle costuras', alt: 'Butacas a medida — detalle de costuras' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', title: 'Personalización', alt: 'Butacas personalizadas — estructura y confort' },
  ],
}

const TAB_GALLERY_FILES = {
  ventanas: {
    toyota: [{ file: 'src/assets/images/ventanas/marcas/toyota/toyota.jpg', alt: 'Ventanas Toyota' }],
    peugeot: [{ file: 'src/assets/images/ventanas/marcas/peugeot/peugeot.jfif', alt: 'Ventanas Peugeot' }],
    renault: [{ file: 'src/assets/images/ventanas/marcas/renault/renault.jpg', alt: 'Ventanas Renault' }],
    suzuki: [{ file: 'src/assets/images/ventanas/marcas/suzuki/suzuki.jpg', alt: 'Ventanas Suzuki' }],
    fiat: [{ file: 'src/assets/images/ventanas/marcas/fiat/fiat.jpg', alt: 'Ventanas Fiat' }],
    citroen: [
      { file: 'src/assets/images/ventanas/marcas/citroen/citroen-1.jfif', alt: 'Ventanas Citroën' },
      { file: 'src/assets/images/ventanas/marcas/citroen/citroen-2.jfif', alt: 'Ventanas Citroën instalación' },
    ],
    chevrolet: [
      { file: 'src/assets/images/ventanas/marcas/chevrolet/chev1.jpg', alt: 'Ventanas Chevrolet' },
      { file: 'src/assets/images/ventanas/marcas/chevrolet/chev2.jpg', alt: 'Ventanas Chevrolet detalle' },
      { file: 'src/assets/images/ventanas/marcas/chevrolet/chev3.jpg', alt: 'Ventanas Chevrolet interior' },
    ],
  },
  banquetas: {
    adultos: [
      { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', alt: 'Banquetas adultos' },
      { file: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', alt: 'Banquetas adultos terminación' },
    ],
    traslado: [
      { file: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', alt: 'Banquetas traslado personal' },
      { file: 'src/assets/images/banquetas/traslado/banq_tras_pers2.jpg', alt: 'Banquetas traslado personal interior' },
      { file: 'src/assets/images/banquetas/traslado/banq_tras_pers3.jpg', alt: 'Banquetas traslado personal detalle' },
    ],
    escolares: [
      { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', alt: 'Banquetas escolares' },
      { file: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', alt: 'Banquetas escolares instalación' },
      { file: 'src/assets/images/banquetas/escolares/banq_esc2.jpg', alt: 'Banquetas escolares detalle' },
    ],
  },
  accesorios: {
    cabeceras: [{ file: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg', alt: 'Cabeceras Utilcar' }],
    'apoya-brazos': [{ file: 'src/assets/images/accesorios/apoya-brazos/apoya_brazos.jpg', alt: 'Apoya brazos' }],
    balizas: [{ file: 'src/assets/images/accesorios/balizas/baliza.jpg', alt: 'Baliza amarilla 12V' }],
    'distintivo-escolar': [{ file: 'src/assets/images/accesorios/distintivo-escolar/esc.jpg', alt: 'Distintivo escolar' }],
  },
}

const PAGE_SOURCES = [
  {
    pageKey: 'ventanas-lunetas',
    title: 'Ventanas y lunetas',
    content: ventanasLunetasContent,
    tabs: VENTANAS_BRANDS,
    tabsSection: ventanasLunetasContent.brands,
    tabGalleryKey: 'ventanas',
    introExtras: {
      procesoTemplado: ventanasLunetasContent.intro?.procesoTemplado,
      especificaciones: ventanasLunetasContent.intro?.especificaciones ?? [],
    },
  },
  {
    pageKey: 'equipamiento-escolar',
    title: 'Equipamiento escolar',
    content: equipamientoEscolarContent,
    tabs: [],
    featuresFrom: 'specs',
  },
  {
    pageKey: 'banquetas',
    title: 'Banquetas',
    content: banquetasContent,
    tabs: banquetasContent.categories?.items ?? BANQUETAS_CATEGORIES,
    tabsSection: banquetasContent.categories,
    tabGalleryKey: 'banquetas',
  },
  {
    pageKey: 'butacas',
    title: 'Butacas',
    content: butacasContent,
    tabs: [],
    featuresFrom: 'specs',
  },
  {
    pageKey: 'accesorios',
    title: 'Accesorios',
    content: accesoriosContent,
    tabs: accesoriosContent.catalog?.categories ?? ACCESORIOS_CATEGORIES,
    tabsSection: accesoriosContent.catalog,
    tabGalleryKey: 'accesorios',
  },
  {
    pageKey: 'talleres-moviles',
    title: 'Talleres móviles',
    content: talleresMovilesContent,
    tabs: [],
    featuresFrom: 'scope',
  },
]

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function fileStat(relativePath) {
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    return { exists: false, path: relativePath, abs, size: 0 }
  }
  return { exists: true, path: relativePath, abs, size: statSync(abs).size }
}

/** Plan de assets por página (referencias + únicos). */
function collectAssetPlan(pageConfig) {
  const { pageKey, tabGalleryKey, tabs = [] } = pageConfig
  const refs = []
  const unique = new Map()

  function addRef(path, role, detail = '') {
    if (!path) return
    const stat = fileStat(path)
    refs.push({ path, role, detail, ...stat })
    if (stat.exists && !unique.has(path)) {
      unique.set(path, stat.size)
    }
  }

  const heroPath = HERO_IMAGE_FILES[pageKey]
  if (heroPath) addRef(heroPath, 'hero')

  for (const entry of PAGE_GALLERY_FILES[pageKey] ?? []) {
    addRef(entry.file, 'gallery', entry.title)
  }

  const tabMap = TAB_GALLERY_FILES[tabGalleryKey] ?? {}
  for (const tab of tabs) {
    const files = tabMap[tab.id] ?? []
    for (const fileEntry of files) {
      addRef(fileEntry.file, 'tab-gallery', `${tab.name} (${tab.id})`)
    }
  }

  let uniqueBytes = 0
  for (const size of unique.values()) uniqueBytes += size

  const found = refs.filter((r) => r.exists).length
  const missing = refs.filter((r) => !r.exists)

  return {
    refs,
    missing,
    refCount: refs.length,
    foundCount: found,
    missingCount: missing.length,
    uniqueUploadCount: unique.size,
    uniqueBytes,
    duplicateRefs: refs.length - unique.size,
  }
}

function blockKey(prefix, index) {
  return `${prefix}-${index}`
}

function paragraphsToPortableText(paragraphs = []) {
  return paragraphs
    .filter(Boolean)
    .map((text, index) => ({
      _type: 'block',
      _key: blockKey('pt', index),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: blockKey('span', index),
          text: String(text),
          marks: [],
        },
      ],
    }))
}

function buildHeroBlock(hero, imageRef, order = 0) {
  return {
    _type: 'heroBlock',
    _key: blockKey('hero', order),
    enabled: true,
    order,
    eyebrow: hero.eyebrow ?? 'Servicios',
    title: hero.title ?? '',
    subtitle: hero.subtitle ?? '',
    imageAlt: hero.imageAlt ?? hero.title ?? '',
    highlights: [],
    image: imageRef ?? undefined,
  }
}

function buildRichTextBlock(intro, order = 1) {
  const paragraphs = [...(intro?.paragraphs ?? [])]
  if (intro?.description && !paragraphs.includes(intro.description)) {
    paragraphs.unshift(intro.description)
  }
  const bodyParagraphs = paragraphs.length > 0 ? paragraphs : intro?.title ? [intro.title] : []

  return {
    _type: 'richTextBlock',
    _key: blockKey('richtext', order),
    enabled: true,
    order,
    eyebrow: intro?.eyebrow ?? '',
    title: intro?.title ?? '',
    body: paragraphsToPortableText(bodyParagraphs),
  }
}

function buildFeaturesBlock(source, featuresFrom, order = 2) {
  let groups = []

  if (featuresFrom === 'scope' && source?.scope?.lists) {
    const { soluciones, caracteristicas } = source.scope.lists
    groups = [
      soluciones?.items?.length
        ? { _key: blockKey('fg', 0), title: soluciones.title, items: soluciones.items }
        : null,
      caracteristicas?.items?.length
        ? { _key: blockKey('fg', 1), title: caracteristicas.title, items: caracteristicas.items }
        : null,
    ].filter(Boolean)
  } else if (featuresFrom === 'specs' && source?.specs?.sections) {
    groups = source.specs.sections.map((section, index) => ({
      _key: blockKey('fg', index),
      title: section.title,
      items: section.items ?? [],
    }))
  }

  const meta = featuresFrom === 'scope' ? source.scope : source.specs

  return {
    _type: 'featuresBlock',
    _key: blockKey('features', order),
    enabled: true,
    order,
    eyebrow: meta?.eyebrow ?? '',
    title: meta?.title ?? '',
    description: meta?.description ?? '',
    groups,
  }
}

function buildPortfolioBlock(gallery, items, order = 3) {
  return {
    _type: 'portfolioBlock',
    _key: blockKey('portfolio', order),
    enabled: true,
    order,
    eyebrow: gallery?.eyebrow ?? 'Galería',
    title: gallery?.title ?? 'Galería',
    description: gallery?.description ?? '',
    items: items.map((item, index) => ({
      _type: 'portfolioBlockItem',
      _key: blockKey('pi', index),
      title: item.title ?? `Imagen ${index + 1}`,
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      client: item.client ?? '',
      vehicle: item.vehicle ?? '',
      image: item.image,
      featured: index === 0,
    })),
  }
}

function buildCtaBlock(cta, order = 4) {
  const label = cta?.primaryLabel ?? cta?.buttonLabel ?? 'Solicitar cotización'
  const link = cta?.primaryTo ?? cta?.buttonLink ?? '/contacto'

  return {
    _type: 'ctaBlock',
    _key: blockKey('cta', order),
    enabled: true,
    order,
    title: cta?.title ?? '',
    description: cta?.description ?? '',
    buttonLabel: label,
    buttonLink: link,
    buttonText: label,
  }
}

function buildSeoBlock(pageKey, order = 5) {
  const seo = PAGE_SEO[pageKey] ?? {}
  return {
    _type: 'seoBlock',
    _key: blockKey('seo', order),
    enabled: true,
    order,
    title: seo.title ?? '',
    description: seo.description ?? '',
    canonicalPath: seo.canonicalPath ?? `/${pageKey}`,
    noindex: false,
  }
}

function mapTab(tab, galleryEntries) {
  return {
    _type: 'serviceTab',
    _key: blockKey('tab', tab.id),
    id: tab.id,
    name: tab.name,
    description: tab.description ?? tab.intro?.[0] ?? '',
    models: tab.models ?? [],
    subtitle: tab.subtitle ?? '',
    intro: tab.intro ?? [],
    sections: (tab.sections ?? []).map((section, index) => ({
      _key: blockKey('sec', index),
      title: section.title,
      items: section.items ?? [],
    })),
    gallery: galleryEntries,
    extra: tab.extra ?? undefined,
  }
}

function createImageUploader(client, cache, uploadStats) {
  return async (relativePath, alt) => {
    if (!relativePath) return null

    if (!client) {
      uploadStats.planned += 1
      const stat = fileStat(relativePath)
      if (!stat.exists) {
        uploadStats.missing.push(relativePath)
        return null
      }
      if (cache.has(relativePath)) {
        uploadStats.cached += 1
        return cache.get(relativePath)
      }
      uploadStats.wouldUpload += 1
      uploadStats.bytes += stat.size
      const placeholder = {
        _type: 'image',
        alt: alt || basename(relativePath),
        _verifyOnly: true,
      }
      cache.set(relativePath, placeholder)
      return placeholder
    }

    if (cache.has(relativePath)) {
      uploadStats.cached += 1
      return cache.get(relativePath)
    }

    const stat = fileStat(relativePath)
    if (!stat.exists) {
      uploadStats.missing.push(relativePath)
      return null
    }

    uploadStats.uploaded += 1
    uploadStats.bytes += stat.size

    const asset = await client.assets.upload('image', createReadStream(stat.abs), {
      filename: basename(stat.abs),
    })

    const ref = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: alt || basename(stat.abs),
    }
    cache.set(relativePath, ref)
    return ref
  }
}

async function buildPageDocument(pageConfig, uploadImage) {
  const { pageKey, title, content, tabs, tabsSection, tabGalleryKey, introExtras, featuresFrom } =
    pageConfig

  const heroPath = HERO_IMAGE_FILES[pageKey]
  const heroImage = heroPath ? await uploadImage(heroPath, content.hero?.imageAlt) : null

  const blocks = [
    buildHeroBlock(content.hero, heroImage, 0),
    buildRichTextBlock(content.intro, 1),
  ]

  let order = 2
  const featuresBlock = buildFeaturesBlock(content, featuresFrom, order)
  const hasFeatureGroups = (featuresBlock.groups?.length ?? 0) > 0
  if (featuresFrom && hasFeatureGroups) {
    blocks.push(featuresBlock)
    order += 1
  }

  const galleryMeta = content.gallery
  const galleryFiles = PAGE_GALLERY_FILES[pageKey] ?? []
  let portfolioItemCount = 0
  if (galleryMeta) {
    const defaults = PAGE_PORTFOLIO_DEFAULTS[pageKey] ?? {
      category: galleryMeta.title ?? 'Servicios',
      client: PORTFOLIO_PLACEHOLDERS.client,
      vehicle: PORTFOLIO_PLACEHOLDERS.vehicle,
      description: PORTFOLIO_PLACEHOLDERS.description,
    }
    const items = []
    for (const entry of galleryFiles) {
      const image = await uploadImage(entry.file, entry.alt)
      if (!image) continue
      items.push({
        title: entry.title,
        subtitle: defaults.category,
        description: entry.description ?? defaults.description ?? PORTFOLIO_PLACEHOLDERS.description,
        client: defaults.client ?? PORTFOLIO_PLACEHOLDERS.client,
        vehicle: defaults.vehicle ?? PORTFOLIO_PLACEHOLDERS.vehicle,
        image,
      })
    }
    portfolioItemCount = items.length
    if (WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS.has(pageKey)) {
      items.length = 0
    }
    blocks.push(buildPortfolioBlock(galleryMeta, items, order))
    order += 1
  }

  const cta = content.cta ?? {
    ...serviceCtaDefaults,
    primaryLabel: 'Solicitar cotización',
    primaryTo: '/contacto',
  }
  blocks.push(buildCtaBlock(cta, order))
  blocks.push(buildSeoBlock(pageKey, order + 1))

  const tabGalleryMap = TAB_GALLERY_FILES[tabGalleryKey] ?? {}
  const mappedTabs = []
  let tabGalleryImageCount = 0
  for (const tab of tabs ?? []) {
    const files = tabGalleryMap[tab.id] ?? []
    const gallery = []
    for (const [index, fileEntry] of files.entries()) {
      const image = await uploadImage(fileEntry.file, fileEntry.alt)
      if (!image) continue
      tabGalleryImageCount += 1
      gallery.push({
        _key: blockKey('gal', index),
        image,
        alt: fileEntry.alt,
        caption: tab.name,
      })
    }
    mappedTabs.push(mapTab(tab, gallery))
  }

  return {
    _id: serviceSubPageDocumentId(pageKey),
    _type: 'serviceSubPage',
    schemaVersion: SCHEMA_VERSION_VALUE,
    pageKey,
    title,
    blocks,
    tabsSection: tabsSection
      ? {
          eyebrow: tabsSection.eyebrow ?? '',
          title: tabsSection.title ?? '',
          description: tabsSection.description ?? '',
        }
      : undefined,
    tabs: mappedTabs,
    introExtras:
      introExtras?.procesoTemplado || introExtras?.especificaciones?.length
        ? introExtras
        : undefined,
    _meta: {
      heroHasImage: Boolean(heroImage),
      portfolioItemCount,
      tabGalleryImageCount,
      blockTypes: blocks.map((b) => b._type),
    },
  }
}

function validateBuiltDocument(doc, pageConfig) {
  const issues = []
  const seo = doc.blocks.find((b) => b._type === 'seoBlock')
  if (!seo) issues.push('falta seoBlock')
  else if (!seo.title?.trim() || !seo.description?.trim() || !seo.canonicalPath?.trim()) {
    issues.push('seoBlock incompleto (title/description/canonical)')
  }

  const expectedTabs = EXPECTED_TAB_COUNTS[pageConfig.pageKey]
  if (expectedTabs !== undefined && doc.tabs.length !== expectedTabs) {
    issues.push(`tabs: esperado ${expectedTabs}, obtenido ${doc.tabs.length}`)
  } else if (expectedTabs === undefined && doc.tabs.length !== 0) {
    issues.push(`tabs: esperado 0, obtenido ${doc.tabs.length}`)
  }

  return issues
}

async function fetchSanityServiceSubPages(client) {
  return client.fetch(
    `*[_type == "serviceSubPage"]{ _id, pageKey, "blockCount": count(blocks), "tabCount": count(tabs) } | order(pageKey asc)`
  )
}

function printAssetReport(pageConfig, plan) {
  const { pageKey, title } = pageConfig
  console.info(`\n${title} (${pageKey})`)
  console.info(`  documento: ${serviceSubPageDocumentId(pageKey)}`)

  const heroRef = plan.refs.find((r) => r.role === 'hero')
  if (heroRef) {
    console.info(`  hero: ${heroRef.exists ? 'OK' : 'FALTA'} — ${heroRef.path}`)
  } else {
    console.info('  hero: (sin imagen configurada)')
  }

  const galleryRefs = plan.refs.filter((r) => r.role === 'gallery')
  const galleryOk = galleryRefs.filter((r) => r.exists).length
  if (galleryRefs.length) {
    console.info(
      `  gallery (página): ${galleryOk}/${galleryRefs.length} referencias · ${galleryOk === galleryRefs.length ? 'OK' : 'REVISAR'}`
    )
  } else {
    console.info('  gallery (página): —')
  }

  const tabRefs = plan.refs.filter((r) => r.role === 'tab-gallery')
  const tabOk = tabRefs.filter((r) => r.exists).length
  if (tabRefs.length) {
    console.info(
      `  tabs[].gallery: ${tabOk}/${tabRefs.length} referencias · ${tabOk === tabRefs.length ? 'OK' : 'REVISAR'}`
    )
  } else {
    console.info('  tabs[].gallery: —')
  }

  const expectedTabs = EXPECTED_TAB_COUNTS[pageKey]
  const tabCount = pageConfig.tabs?.length ?? 0
  if (expectedTabs !== undefined) {
    console.info(`  tabs: ${tabCount} pestañas (esperado ${expectedTabs}) ${tabCount === expectedTabs ? 'OK' : 'FALTA'}`)
  } else {
    console.info(`  tabs: ${tabCount} (esperado 0) ${tabCount === 0 ? 'OK' : 'FALTA'}`)
  }

  console.info(
    `  uploads únicos: ${plan.uniqueUploadCount} archivos · ${formatBytes(plan.uniqueBytes)}`
  )
  if (plan.duplicateRefs > 0) {
    console.info(`  referencias duplicadas (caché en migración): ${plan.duplicateRefs}`)
  }
  if (plan.missing.length) {
    console.info('  imágenes faltantes:')
    for (const m of plan.missing) {
      console.info(`    ✗ [${m.role}] ${m.path}${m.detail ? ` — ${m.detail}` : ''}`)
    }
  }
}

async function verifySanityDocuments(client, datasetName) {
  console.info('\n── 1. Documentos destino en Sanity ──\n')
  const docs = await fetchSanityServiceSubPages(client)
  const ids = docs.map((d) => d._id)
  const expectedSet = new Set(EXPECTED_DOC_IDS)
  const foundSet = new Set(ids)

  console.info(`  En dataset "${datasetName}": ${docs.length} documento(s) serviceSubPage`)

  for (const id of EXPECTED_DOC_IDS) {
    const doc = docs.find((d) => d._id === id)
    if (doc) {
      console.info(`  ✓ ${id} (tabs: ${doc.tabCount}, blocks: ${doc.blockCount})`)
    } else {
      console.info(`  ○ ${id} — no existe aún (se creará con createOrReplace)`)
    }
  }

  const extras = ids.filter((id) => !expectedSet.has(id))
  if (extras.length) {
    console.info('\n  ⚠ Documentos EXTRA (no deberían existir):')
    for (const id of extras) console.info(`    ${id}`)
  }

  const missing = EXPECTED_DOC_IDS.filter((id) => !foundSet.has(id))
  const okCount = EXPECTED_DOC_IDS.filter((id) => foundSet.has(id)).length

  return {
    pass: extras.length === 0,
    docs,
    extras,
    missing,
    summary: `${okCount}/${EXPECTED_DOC_IDS.length} presentes · ${extras.length} extra(s)`,
  }
}

async function runDatasetSnapshot(sanityEnv) {
  const backupDir = join(WEB_ROOT, 'backups')
  mkdirSync(backupDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dest = join(backupDir, `sanity-${sanityEnv.dataset}-${stamp}.tar.gz`)

  console.info(`\n── Snapshot dataset "${sanityEnv.dataset}" ──\n`)
  console.info(`  Destino: ${dest}\n`)

  return runSanityDatasetExport({
    dataset: sanityEnv.dataset,
    destination: dest,
    webRoot: WEB_ROOT,
    env: sanityEnv,
  })
}

async function main() {
  const sanityEnv = loadSanityEnv({
    requireToken: doMigrate,
    requireProjectId: true,
  })
  sanityEnv.applyToProcessEnv()

  const { projectId, dataset, token } = sanityEnv

  const readClient = createClient({
    projectId,
    dataset,
    apiVersion: '2024-05-28',
    token: token || undefined,
    useCdn: false,
  })

  const writeClient =
    doMigrate &&
    createClient({
      projectId,
      dataset,
      apiVersion: '2024-05-28',
      token,
      useCdn: false,
    })

  const modeLabel = verifyOnly ? 'VERIFICACIÓN PREVIA' : withSnapshot ? 'SNAPSHOT + MIGRACIÓN' : 'MIGRACIÓN'
  console.info(`\n══════════════════════════════════════════`)
  console.info(`  ${modeLabel} — serviceSubPage`)
  console.info(`══════════════════════════════════════════`)
  console.info(`Proyecto: ${projectId} · Dataset: ${dataset}\n`)

  console.info('── IDs destino (exactamente 6) ──\n')
  for (const id of EXPECTED_DOC_IDS) console.info(`  ${id}`)

  const sanityCheck = await verifySanityDocuments(readClient, dataset)

  console.info('\n── 2. Assets en disco (src/assets/images/) ──')

  const assetPlans = []
  let totalUniqueBytes = 0
  let totalUniqueFiles = 0
  let totalMissing = 0

  for (const pageConfig of PAGE_SOURCES) {
    const plan = collectAssetPlan(pageConfig)
    assetPlans.push({ pageConfig, plan })
    totalUniqueBytes += plan.uniqueBytes
    totalUniqueFiles += plan.uniqueUploadCount
    totalMissing += plan.missingCount
    printAssetReport(pageConfig, plan)
  }

  console.info('\n── Resumen assets ──')
  console.info(`  Archivos únicos a subir: ${totalUniqueFiles}`)
  console.info(`  Tamaño estimado: ${formatBytes(totalUniqueBytes)}`)
  console.info(`  Referencias faltantes en disco: ${totalMissing}`)

  console.info('\n── 3. Simulación de documentos (bloques + SEO + tabs) ──')

  const imageCache = new Map()
  const globalUploadStats = { planned: 0, wouldUpload: 0, cached: 0, uploaded: 0, missing: [], bytes: 0 }
  const uploadImage = createImageUploader(writeClient, imageCache, globalUploadStats)

  const builtDocs = []
  const allIssues = []

  for (const pageConfig of PAGE_SOURCES) {
    const doc = await buildPageDocument(pageConfig, uploadImage)
    const { _meta, ...sanityDoc } = doc
    builtDocs.push({ pageConfig, doc: sanityDoc, meta: _meta })

    const issues = validateBuiltDocument(doc, pageConfig)
    if (issues.length) allIssues.push({ pageKey: pageConfig.pageKey, issues })

    const seo = doc.blocks.find((b) => b._type === 'seoBlock')
    console.info(`\n${pageConfig.title}`)
    console.info(`  bloques: ${doc.blocks.map((b) => b._type).join(' → ')}`)
    console.info(`  seoBlock: ${seo ? 'OK' : 'FALTA'}`)
    console.info(`  tabs.length: ${doc.tabs.length}`)
    if (_meta.portfolioItemCount) {
      console.info(`  portfolioBlock items: ${_meta.portfolioItemCount}`)
    }
    if (_meta.tabGalleryImageCount) {
      console.info(`  imágenes en tabs[].gallery: ${_meta.tabGalleryImageCount}`)
    }
    if (issues.length) {
      console.info(`  ⚠ ${issues.join('; ')}`)
    }
  }

  if (verifyOnly) {
    console.info('\n── Simulación uploads (deduplicados) ──')
    console.info(`  Referencias procesadas: ${globalUploadStats.planned}`)
    console.info(`  Uploads únicos: ${globalUploadStats.wouldUpload}`)
    console.info(`  Omitidas por caché: ${globalUploadStats.cached}`)
    if (globalUploadStats.missing.length) {
      console.info(`  Faltantes en runtime: ${globalUploadStats.missing.length}`)
    }
  }

  console.info('\n── Checklist ──')
  const checks = [
    { name: '6 page keys definidos', pass: PAGE_SOURCES.length === 6 },
    { name: '6 IDs destino', pass: EXPECTED_DOC_IDS.length === 6 },
    { name: 'Sin docs extra en Sanity', pass: sanityCheck.pass },
    { name: 'Sin imágenes faltantes en disco', pass: totalMissing === 0 },
    { name: 'Todos con seoBlock', pass: builtDocs.every((b) => b.doc.blocks.some((x) => x._type === 'seoBlock')) },
    {
      name: 'Tabs ventanas/banquetas/accesorios',
      pass: allIssues.every((i) => !i.issues.some((x) => x.startsWith('tabs:'))),
    },
    { name: 'Sin issues de validación', pass: allIssues.length === 0 },
  ]

  let allPass = true
  for (const c of checks) {
    console.info(`  ${c.pass ? '✓' : '✗'} ${c.name}`)
    if (!c.pass) allPass = false
  }

  console.info(`\n  Sanity: ${sanityCheck.summary}`)

  if (!allPass && verifyOnly) {
    console.info('\n✗ Verificación fallida. Corrija antes de migrar.\n')
    process.exit(1)
  }

  if (verifyOnly) {
    console.info('\n✓ Verificación OK. Ejecute: npm run migrate:services\n')
    return
  }

  if (withSnapshot) {
    try {
      await runDatasetSnapshot(sanityEnv)
    } catch (err) {
      console.error('\n✗ Snapshot abortado:', err.message)
      console.error('  Ejecute npm run sanity:doctor o exporte manualmente desde el Studio detectado.\n')
      process.exit(1)
    }
  }

  console.info('\n── Publicando en Sanity ──\n')

  for (const { doc } of builtDocs) {
    await writeClient.createOrReplace(doc)
    console.info(`  ✓ ${doc._id}`)
  }

  const after = await fetchSanityServiceSubPages(writeClient)
  console.info('\n── Post-migración ──')
  for (const id of EXPECTED_DOC_IDS) {
    const doc = after.find((d) => d._id === id)
    if (!doc) {
      console.info(`  ✗ ${id} — no encontrado`)
      allPass = false
      continue
    }
    const seo = (
      await writeClient.fetch(`*[_id == $id][0].blocks[_type == "seoBlock"][0]{ title, canonicalPath }`, {
        id,
      })
    )
    console.info(
      `  ✓ ${id} · tabs: ${doc.tabCount} · blocks: ${doc.blockCount} · seo: ${seo?.canonicalPath ?? 'FALTA'}`
    )
  }

  const extras = after.filter((d) => !EXPECTED_DOC_IDS.includes(d._id))
  if (extras.length) {
    console.info('\n  ⚠ Documentos extra:', extras.map((d) => d._id).join(', '))
  }

  console.info('\nListo. Revise Studio → Servicios.\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

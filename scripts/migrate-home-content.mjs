/**
 * Migra contenido local Home → Sanity homePage (blocks[] completos).
 *
 * npm run migrate:home
 * npm run migrate:home:verify
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

const seed = JSON.parse(
  readFileSync(join(WEB_ROOT, 'utilcar-studio/seed/minimal-content.json'), 'utf8'),
)
const homeContent = seed.homePage

const TRABAJOS_PREVIEW_IDS = ['1', '2', '3']

const verifyOnly = process.argv.includes('--verify') || process.argv.includes('--dry')
const doMigrate = !verifyOnly

const SERVICE_ENTRIES = [
  {
    id: 'talleres',
    title: 'Talleres móviles',
    description:
      'Unidades equipadas para servicio técnico en ruta, con mobiliario, electricidad y seguridad certificada.',
    path: '/talleres-moviles',
    imageAlt: 'Taller móvil en furgón',
    icon: 'wrench',
    file: 'src/assets/images/services/talleres.jpg',
  },
  {
    id: 'ventanas',
    title: 'Ventanas y Lunetas',
    description:
      'Ventiletes y lunetas a medida por marca y modelo, con terminaciones industriales y sellado profesional.',
    path: '/ventanas-lunetas',
    imageAlt: 'Ventanas laterales corredizas',
    icon: 'settings',
    file: 'src/assets/images/services/ventanas.jpg',
  },
  {
    id: 'escolar',
    title: 'Equipamiento Escolar',
    description:
      'Conversiones para transporte escolar con normativas de seguridad, asientos y accesorios homologados.',
    path: '/equipamiento-escolar',
    imageAlt: 'Equipamiento escolar en bus',
    icon: 'bus',
    file: 'src/assets/images/services/escolar.jpg',
  },
  {
    id: 'banquetas',
    title: 'Banquetas',
    description:
      'Banquetas modulares para vans y minibuses, tapizados técnicos y anclajes reforzados.',
    path: '/banquetas',
    imageAlt: 'Banquetas para minibús',
    icon: 'star',
    file: 'src/assets/images/services/banquetas.jpg',
  },
  {
    id: 'butacas',
    title: 'Butacas',
    description:
      'Butacas ergonómicas para flotas corporativas y turismo, con opciones reclinables y cinturones.',
    path: '/butacas',
    imageAlt: 'Butacas ergonómicas a medida',
    icon: 'users',
    file: 'src/assets/images/services/butacas.jfif',
  },
  {
    id: 'accesorios',
    title: 'Accesorios',
    description:
      'Portaequipaje, divisores, pisos, iluminación LED y complementos para conversiones integrales.',
    path: '/accesorios',
    imageAlt: 'Accesorios para conversión vehicular',
    icon: 'truck',
    file: 'src/assets/images/services/accesorios.jpg',
  },
]

const ESPECIALIDADES = homeContent.especialidades?.items ?? []
const SPECIALTY_IMAGES = {
  furgones: 'src/assets/images/ventanas/vent2.jpg',
  escolar: 'src/assets/images/services/escolar.jpg',
  banquetas: 'src/assets/images/services/banquetas.jpg',
}

const WHY_US_ITEMS = [
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

function createKey() {
  return Math.random().toString(36).slice(2, 12)
}

function fileStat(relativePath) {
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) return { exists: false, abs }
  return { exists: true, abs, size: statSync(abs).size }
}

function createImageUploader(client, cache, stats) {
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

function mapSpecialtyCategory(item, heroImage) {
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

async function buildHomeBlocks(uploadImage) {
  const hero = homeContent.hero
  const heroImage = await uploadImage('src/assets/images/hero.jpg', hero.imageAlt)

  const heroBlock = {
    _type: 'heroBlock',
    _key: createKey(),
    enabled: true,
    order: 0,
    title: hero.title,
    subtitle: hero.subtitle,
    highlights: hero.highlights ?? [],
    textLinkLabel: hero.secondaryLink?.label ?? 'Ver trabajos realizados',
    textLinkUrl: hero.secondaryLink?.to ?? '/trabajos-realizados',
    image: heroImage,
    imageAlt: hero.imageAlt,
  }

  const serviceItems = []
  for (const entry of SERVICE_ENTRIES) {
    const image = await uploadImage(entry.file, entry.imageAlt)
    serviceItems.push({
      _type: 'serviceBlockItem',
      _key: createKey(),
      title: entry.title,
      description: entry.description,
      icon: entry.icon,
      image,
      link: { label: homeContent.services.cardLinkLabel || 'Ver más', path: entry.path },
    })
  }

  const servicesBlock = {
    _type: 'servicesBlock',
    _key: createKey(),
    enabled: true,
    order: 1,
    ...homeContent.services,
    items: serviceItems,
  }

  const categories = []
  for (const item of ESPECIALIDADES) {
    const imagePath = SPECIALTY_IMAGES[item.id]
    const heroImage = imagePath ? await uploadImage(imagePath, item.imageAlt) : null
    categories.push(mapSpecialtyCategory(item, heroImage))
  }

  const specialtiesBlock = {
    _type: 'specialtiesBlock',
    _key: createKey(),
    enabled: true,
    order: 2,
    ...homeContent.especialidades,
    categories,
    items: [],
  }

  const whyUtilcarBlock = {
    _type: 'whyUtilcarBlock',
    _key: createKey(),
    enabled: true,
    order: 3,
    sectionEyebrow: homeContent.highlights.eyebrow,
    sectionTitle: homeContent.highlights.title,
    sectionDescription: '',
    items: WHY_US_ITEMS.map((item) => ({
      _type: 'whyUsBlockItem',
      _key: createKey(),
      ...item,
    })),
  }

  const featuredProjects = TRABAJOS_PREVIEW_IDS.map((projectId) => ({
    _type: 'featuredProjectRef',
    _key: createKey(),
    projectId,
  }))

  const portfolioBlock = {
    _type: 'portfolioBlock',
    _key: createKey(),
    enabled: true,
    order: 4,
    ...homeContent.portfolioPreview,
    featuredProjects,
    items: [],
  }

  const ctaBlock = {
    _type: 'ctaBlock',
    _key: createKey(),
    enabled: true,
    order: 5,
    title: homeContent.ctaBanner.title,
    description: homeContent.ctaBanner.description,
  }

  return [heroBlock, servicesBlock, specialtiesBlock, whyUtilcarBlock, portfolioBlock, ctaBlock]
}

const sanityEnv = loadSanityEnv({ requireToken: doMigrate })
sanityEnv.applyToProcessEnv()

const client = doMigrate
  ? createClient({
      projectId: sanityEnv.projectId,
      dataset: sanityEnv.dataset,
      apiVersion: '2024-05-28',
      token: sanityEnv.token,
      useCdn: false,
    })
  : null

const cache = new Map()
const stats = { uploaded: 0, wouldUpload: 0, missing: [] }

console.info('\n══════════════════════════════════════')
console.info('  MIGRACIÓN — homePage')
console.info('══════════════════════════════════════\n')

const blocks = await buildHomeBlocks(createImageUploader(client, cache, stats))

console.info(`Bloques: ${blocks.length}`)
console.info(`  heroBlock — imagen: ${blocks[0].image ? 'OK' : 'FALTA'}`)
console.info(`  servicesBlock — items: ${blocks[1].items?.length ?? 0}`)
console.info(`  specialtiesBlock — categories: ${blocks[2].categories?.length ?? 0}`)
console.info(`  whyUtilcarBlock — items: ${blocks[3].items?.length ?? 0}`)
console.info(`  portfolioBlock — featured: ${blocks[4].featuredProjects?.length ?? 0}`)
console.info(`  ctaBlock — título: ${blocks[5].title ? 'OK' : 'FALTA'}`)

if (stats.missing.length) {
  console.info('\n⚠ Imágenes faltantes:')
  for (const path of stats.missing) console.info(`  - ${path}`)
}

if (!doMigrate) {
  console.info('\nModo verify — sin escritura en Sanity.')
  process.exit(stats.missing.length ? 1 : 0)
}

const doc = {
  _id: 'homePage',
  _type: 'homePage',
  schemaVersion: SCHEMA_VERSION_VALUE,
  blocks,
  hero: {
    title: homeContent.hero.title,
    subtitle: homeContent.hero.subtitle,
    highlights: homeContent.hero.highlights,
    secondaryLink: homeContent.hero.secondaryLink,
    imageAlt: homeContent.hero.imageAlt,
  },
  services: homeContent.services,
  especialidades: {
    eyebrow: homeContent.especialidades.eyebrow,
    title: homeContent.especialidades.title,
    description: homeContent.especialidades.description,
    itemEyebrowPrefix: homeContent.especialidades.itemEyebrowPrefix,
  },
  highlights: homeContent.highlights,
  portfolioPreview: homeContent.portfolioPreview,
  ctaBanner: {
    title: homeContent.ctaBanner.title,
    description: homeContent.ctaBanner.description,
  },
  specialtiesNew: [],
}

await client.createOrReplace(doc)
console.info('\n✓ homePage publicado en Sanity')
process.exit(0)

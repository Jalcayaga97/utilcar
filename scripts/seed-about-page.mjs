/**
 * Crea o actualiza el documento singleton aboutPage en Sanity.
 *
 * npm run seed:about-page:dry
 * npm run seed:about-page
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

/** Contenido editorial (sin imports @/ — compatible con Node). */
const aboutContent = {
  hero: {
    eyebrow: 'Utilcar',
    title: 'Sobre Nosotros',
    subtitle:
      'Más de dos décadas fabricando e instalando soluciones de conversión y equipamiento automotriz en Santiago.',
    imageAlt: 'Taller Utilcar — conversiones y equipamiento automotriz, Santiago',
  },
  historia: {
    eyebrow: 'Nuestra historia',
    title: 'Ingeniería y fabricación con foco en el transporte',
    paragraphs: [
      'Utilcar Conversiones nació como un taller especializado en modificaciones de vehículos comerciales y de transporte de pasajeros. Con el tiempo ampliamos nuestra capacidad productiva para ofrecer soluciones integrales: talleres móviles, ventanas y lunetas, equipamiento escolar, banquetas, butacas y accesorios.',
      'Hoy trabajamos con empresas, flotas, talleres y fabricantes que requieren terminaciones profesionales, cumplimiento normativo y acompañamiento técnico en cada etapa del proyecto.',
      'Nuestro taller en Quinta Normal, Santiago, concentra diseño, fabricación e instalación con control de calidad en cada entrega.',
    ],
  },
  features: {
    eyebrow: 'Qué hacemos',
    title: 'Soluciones para cada operación',
    description:
      'Desarrollamos conversiones y equipamiento a medida según marca, modelo y uso operativo de su flota.',
    items: [
      {
        title: 'Ingeniería propia',
        description: 'Diseño y fabricación con control de calidad en cada etapa del proceso.',
      },
      {
        title: 'A medida por vehículo',
        description: 'Soluciones adaptadas a marca, modelo y uso operativo de su flota.',
      },
      {
        title: 'Instalación certificada',
        description: 'Taller especializado con protocolos de montaje y terminación premium.',
      },
    ],
  },
  cta: {
    title: 'Conversemos sobre su próximo proyecto',
    description:
      'Nuestro equipo técnico releva su vehículo y propone materiales, layout y plazos según su operación.',
    primaryLabel: 'Solicitar cotización',
    primaryTo: '/contacto',
  },
}

const ABOUT_SEO = {
  path: '/sobre-nosotros',
  title: 'Sobre Nosotros — Utilcar Conversiones',
  description:
    'Conozca Utilcar Conversiones: más de dos décadas en conversiones automotrices, equipamiento escolar, talleres móviles y fabricación a medida en Santiago.',
  keywords:
    'Utilcar Conversiones, sobre nosotros, conversiones automotrices Santiago, taller Quinta Normal',
}

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const DOCUMENT_ID = 'aboutPage'

function blockKey(prefix = 'blk') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function plainTextBody(paragraphs) {
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs]
  return list
    .map((text) => String(text ?? '').trim())
    .filter(Boolean)
    .map((text) => ({
      _type: 'block',
      _key: blockKey('pt'),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: blockKey('sp'), text, marks: [] }],
    }))
}

function buildBlocks() {
  const { hero, historia, features, cta } = aboutContent
  let order = 0

  return [
    {
      _type: 'heroBlock',
      _key: blockKey('hero'),
      enabled: true,
      order: order++,
      eyebrow: hero.eyebrow ?? '',
      title: hero.title ?? '',
      subtitle: hero.subtitle ?? '',
      imageAlt: hero.imageAlt ?? '',
    },
    {
      _type: 'richTextBlock',
      _key: blockKey('historia'),
      enabled: true,
      order: order++,
      eyebrow: historia.eyebrow ?? '',
      title: historia.title ?? '',
      body: plainTextBody(historia.paragraphs ?? []),
    },
    {
      _type: 'featureGridBlock',
      _key: blockKey('features'),
      enabled: true,
      order: order++,
      eyebrow: features.eyebrow ?? '',
      title: features.title ?? '',
      description: features.description ?? '',
      items: (features.items ?? []).map((item, index) => ({
        _key: blockKey(`feat-${index}`),
        _type: 'whyUsBlockItem',
        title: item.title ?? '',
        description: item.description ?? '',
        icon: ['Bus', 'Truck', 'Wrench'][index] ?? 'Wrench',
      })),
    },
    {
      _type: 'ctaBlock',
      _key: blockKey('cta'),
      enabled: true,
      order: order++,
      title: cta.title ?? '',
      description: cta.description ?? '',
      primaryLabel: cta.primaryLabel ?? '',
      primaryTo: cta.primaryTo ?? '/contacto',
    },
    {
      _type: 'seoBlock',
      _key: blockKey('seo'),
      enabled: true,
      order: order++,
      title: ABOUT_SEO.title ?? '',
      description: ABOUT_SEO.description ?? '',
      keywords: ABOUT_SEO.keywords ?? '',
      canonicalPath: ABOUT_SEO.path ?? '/sobre-nosotros',
      noindex: false,
    },
  ]
}

const existing = await client.fetch(`*[_id == $id][0]{ _id, _rev, blocks[]{ _type, _key } }`, {
  id: DOCUMENT_ID,
})

const blocks = buildBlocks()
const doc = {
  _id: DOCUMENT_ID,
  _type: 'aboutPage',
  schemaVersion: 1,
  blocks,
}

console.info('\n══════════════════════════════════════')
console.info(`  SEED aboutPage ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

if (existing) {
  console.info(`Documento existente: ${existing._id} (${existing.blocks?.length ?? 0} bloques)`)
} else {
  console.info('Documento: nuevo (aboutPage)')
}

console.info(`Bloques a escribir: ${blocks.map((b) => b._type).join(', ')}`)

if (dryRun) {
  console.info('\nDry-run — sin cambios en Sanity.')
  process.exit(0)
}

if (existing?._rev) {
  await client.createOrReplace({ ...doc, _rev: existing._rev })
} else {
  await client.createIfNotExists(doc)
}

const after = await client.fetch(`*[_id == $id][0]{ _id, blocks[]{ _type, _key } }`, {
  id: DOCUMENT_ID,
})

console.info(`\n✓ aboutPage publicado (${after?.blocks?.length ?? 0} bloques)`)
